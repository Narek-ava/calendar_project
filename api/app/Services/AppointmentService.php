<?php

namespace App\Services;

use App\Http\Controllers\Public\AppointmentController;
use App\Models\Appointment;
use App\Models\Company;
use App\Models\Customer;
use App\Models\Employee;
use App\Models\Location;
use App\Models\Service;
use App\Services\Exceptions\AppointmentException;
use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Glorand\Model\Settings\Exceptions\ModelSettingsException;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Laravel\Cashier\Cashier;
use Omnipay\Common\CreditCard as OmnipayCreditCard;
use Omnipay\Omnipay;
use Srmklive\PayPal\Services\PayPal as PayPalClient;
use Stripe\Exception\ApiErrorException;
use Throwable;

final class AppointmentService
{
    public function __construct(private readonly CustomerService $customerService)
    {
    }

    public function availableSlots(Company $company, string $date, int $serviceId, int $locationId, int $employeeId = null): Collection
    {
        $service = $company->services()->findOrFail($serviceId);
        $location = $company->locations()->findOrFail($locationId);
        $employee = $employeeId ? $company->employees()->findOrFail($employeeId) : null;

        return Appointment::availableSlots($date, $service, $location, $employee);
    }

    /**
     * @param Company $company
     * @param array $data
     * @param bool $isMultipleAppointmentPerSlotAllowed
     * @return array
     */
    public function findSlot(Company $company, array $data, bool $isMultipleAppointmentPerSlotAllowed = false): array
    {
        $availableSlots = $this->availableSlots(
            $company,
            $data['start_at'],
            $data['service_id'],
            $data['location_id'],
            $data['employee_id'] ?? null
        );

        $slot = $availableSlots->where('start_at', $data['start_at'])->first();

        if (!$slot) {
            throw new AppointmentException('Slot not found');
        }

        // Multiple appointments(e.g. prepaid) can be created at same slot
        if ($slot['occupied'] && !$isMultipleAppointmentPerSlotAllowed) throw new AppointmentException('The slot cannot be occupied');

        return $slot;
    }

    /**
     * @throws Throwable
     * @throws ModelSettingsException
     */
    public function customerCreateAppointment(Request $request, Company $company, array $data): Model|Appointment
    {
        // Service level
        $service = $company->services()->find($data['service_id']);
        $isPrepayAppointment = $this->isPrepayAppointment($company, $service, $data);

        // Slot level
        $slot = $this->findSlot($company, $data, $isPrepayAppointment);

        if (!$slot['employee']->self_book) {
            throw new AppointmentException('This employee cannot be selected');
        }

        // Location level
        if ($company->settings()->get('widget.max_advance_booking', 0) > 0) {
            // Get the furthest working day possible
            /* @var Location $location */
            $location = $company->locations()->find($data['location_id']);
            $maxBookedDay = CarbonImmutable::now($location->time_zone)
                ->setTimeFrom($slot['start_at'])
                ->addDays($company->settings()->get('widget.max_advance_booking'));

            if ($slot['start_at']->greaterThan($maxBookedDay)) {
                throw new AppointmentException('No booking can be made for this date');
            }
        }

        // Validate payment
        if ($isPrepayAppointment) {
            $gatewayPayment = match (Arr::get($data, 'payment_details.gateway')) {
                Appointment::PAYPAL_PAYMENT_METHOD        => $this->validatePayPalPayment($company, $service, $data),
                Appointment::AUTHORIZE_NET_PAYMENT_METHOD => $this->validateAuthorizeNetPayment($company, $service, $data),
                Appointment::STRIPE_PAYMENT_METHOD        => $this->validateStripePayment($company, $service, $data),
                default                                   => throw new AppointmentException('The Payment Gateway is required')
            };

            $cbPayment = [[
                // In case of Authorize.Net payment the details will be overwritten with transactions responses
                'details' => Arr::get($data, 'payment_details'),
                'reason'  => Appointment::DEPOSIT_PAYMENT_REASON,
                ...$gatewayPayment
            ]];

            // Fill address from payment form
            if (Arr::get($data, 'payment_details.gateway') === Appointment::AUTHORIZE_NET_PAYMENT_METHOD)
                Arr::set($data, 'user.address', Arr::get($data, 'payment_details.address', []));

            if (Arr::get($data, 'payment_details.gateway') === Appointment::STRIPE_PAYMENT_METHOD)
                Arr::set($data, 'user.address', Arr::get($gatewayPayment, 'address', []));
        }

        // Customer level
        $customer = $this->customerService->getOrCreateCustomer($company, $data['user']);

        Arr::set($data, 'payments', $cbPayment ?? null);

        $appointment = $this->createAppointment(
            $company,
            $service,
            $data['location_id'],
            $slot['employee']->id,
            $customer->id,
            Appointment::ACTIVE_STATUS,
            $slot,
            $data
        );

        if ($company->settings()->get('widget.is_attachments_enabled')) {
            $appointment->images()->createMany(collect($request->validated('images'))->map(function (string $image) {
                return ['link' => $image];
            }));
        }

        return $appointment;
    }

    public function employeeCreateAppointment(Company $company, array $data): Model|Appointment
    {
        if ($this->isSlotOccupiedByAnotherCompany($company, $data))
            throw new AppointmentException('The slot is occupied by another company');

        $service = Service::find($data['service_id']);
        $customer = Customer::find($data['customer_id']);
        $slot = ['start_at' => $data['start_at'], 'end_at' => $data['end_at']];

        $appointment = $this->createAppointment(
            $company,
            $service,
            $data['location_id'],
            $data['employee_id'],
            $customer->id,
            Appointment::ACTIVE_STATUS,
            $slot,
            $data
        );

        $appointment->images()->createMany(collect($data['images'] ?? [])->map(function (string $image) {
            return ['link' => $image];
        }));

        return $appointment;
    }

    /**
     * @param Appointment $appointment
     * @param array $data
     * @return Model|Appointment
     */
    public function customerUpdateAppointment(Appointment $appointment, array $data): Model|Appointment
    {
        $slot = $this->findSlot($appointment->company, [
            'start_at'    => $data['start_at'],
            'service_id'  => $appointment->service->id,
            'location_id' => $appointment->location->id,
            'employee_id' => $appointment->employee->id,
        ]);

        if (!$appointment->service->is_reschedule_enabled) throw new AppointmentException('Rescheduling is disabled for the service of this appointment');
        if (!$appointment->isInReschedulingOrCancelingInterval()) {
            throw new AppointmentException('Rescheduling interval is over for the service of this appointment');
        }

        $data['start_at'] = $slot['start_at'];
        $data['end_at'] = $slot['end_at'];

        $appointment->update($data);
        return $appointment->refresh();
    }

    /**
     * @param Appointment $appointment
     * @param array $data
     * @return Model|Appointment
     */
    public function employeeUpdateAppointment(Appointment $appointment, array $data): Model|Appointment
    {
        if ($this->isSlotOccupiedByAnotherCompany($appointment->company, $data))
            throw new AppointmentException('The slot is occupied by another company');

        // Add service vars to appointment in case if service was changed
        if ($appointment->service->id !== Arr::get($data, 'service_id')) {
            $service = Service::find(Arr::get($data, 'service_id'));

            $data = [
                ...$data,
                'payment_type' => $service->payment_type,
                'price'        => $service->price,
                'prepay'       => $service->prepay,
                'fixed_price'  => $service->fixed_price,
            ];
        }

        $appointment->update($data);

        $images = collect($data['images'] ?? [])->filter(function (array|string $image) use ($appointment) {
            return !is_array($image) && $appointment->images->where('link', $image)->count() === 0;
        })->map(function (string $image) {
            return ['link' => $image];
        });
        $appointment->images()->createMany($images);

        return $appointment->refresh();
    }

    public function createAppointment(
        Company       $company,
        Model|Service $service,
        int           $locationId,
        int           $employeeId,
        int           $customerId,
        string        $status,
        array         $slot,
        array         $data,
    ): Model|Appointment
    {
        return $company->appointments()->create([
            'employee_id'              => $employeeId,
            'location_id'              => $locationId,
            'service_id'               => $service->id,
            'customer_id'              => $customerId,
            'start_at'                 => $slot['start_at'],
            'end_at'                   => $slot['end_at'],
            'time_zone'                => Arr::get($data, 'time_zone'),
            'status'                   => $status,
            'payment_type'             => $service->payment_type,
            'price'                    => $service->price,
            'prepay'                   => $service->prepay,
            'fixed_price'              => $service->fixed_price,
            'note'                     => Arr::get($data, 'note'),
            'private_note'             => Arr::get($data, 'private_note'),
            'payments'                 => Arr::get($data, 'payments'),
            'is_notifications_enabled' => Arr::get($data, 'is_notifications_enabled', true),
        ]);
    }

    public function createBlockedTime(Company $company, array $data): Model|Appointment
    {
        if ($this->isSlotOccupiedByAnotherCompany($company, $data))
            throw new AppointmentException('The slot is occupied by another company');

        return $company->appointments()->create([
            'type'         => Appointment::BLOCKED_TIME_TYPE,
            'employee_id'  => $data['employee_id'],
            'location_id'  => $data['location_id'],
            'start_at'     => $data['start_at'],
            'end_at'       => $data['end_at'],
            'note'         => $data['note'] ?? null,
            'private_note' => $data['private_note'] ?? null,
        ]);
    }

    public function updateBlockedTime(Appointment $appointment, array $data): Model|Appointment
    {
        if ($this->isSlotOccupiedByAnotherCompany($appointment->company, $data))
            throw new AppointmentException('The slot is occupied by another company');

        $appointment->update([
            'employee_id'  => $data['employee_id'],
            'location_id'  => $data['location_id'],
            'start_at'     => $data['start_at'],
            'end_at'       => $data['end_at'],
            'note'         => $data['note'] ?? null,
            'private_note' => $data['private_note'] ?? null,
        ]);

        return $appointment->refresh();
    }

    /**
     * @param Appointment $appointment
     * @param array $data
     * @return Appointment
     */
    public function setStatus(Appointment $appointment, array $data): Appointment
    {
        if ($appointment->status === $data['status']) return $appointment;

        match ($data['status']) {
            Appointment::COMPLETED_STATUS => $this->completeAppointment($appointment),
            Appointment::CANCELED_STATUS  => $this->cancelAppointment($appointment, $data['cancel_reason'] ?? null),
        };

        return $appointment->refresh();
    }

    /**
     * @param Appointment $appointment
     * @param bool $isCompletedAutomatically
     * @return void
     */
    public function completeAppointment(Appointment $appointment, bool $isCompletedAutomatically = false): void
    {
        $update = ['status' => Appointment::COMPLETED_STATUS];

        // Add final payment only for paid && automatically closed appointments
        if ($appointment->payment_type !== Service::FREE_PAYMENT_TYPE && $isCompletedAutomatically) {
            $update['payments'] = collect($appointment->payments)->push([
                'datetime' => Carbon::now(),
                'reason'   => Appointment::SERVICE_PAYMENT_REASON,
                'amount'   => $appointment->price,
                'method'   => Appointment::CASH_PAYMENT_METHOD,
            ]);
        }

        $appointment->update($update);
    }

    /**
     * @param Appointment $appointment
     * @param string|null $cancelReason
     * @return void
     */
    public function cancelAppointment(Appointment $appointment, string $cancelReason = null): void
    {
        $appointment->update([
            'status'        => Appointment::CANCELED_STATUS,
            'cancel_reason' => $cancelReason ?? Appointment::CUSTOMER_CANCELED_CANCEL_REASON,
        ]);
    }

    /**
     * @param Company $company
     * @param Service $service
     * @param array $data
     * @return bool
     * @throws ModelSettingsException
     */
    private function isPrepayAppointment(Company $company, Service $service, array $data): bool
    {
        if ($service->payment_type === Service::FREE_PAYMENT_TYPE) return false;

        if ($service->payment_type === Service::PAID_PAYMENT_TYPE) {
            $customer = $this->customerService->getCustomer($company, $data['user']);

            return
                $company->settings()->get('appointments.no_show_deposit.enabled')
                && $customer?->isNoShowDepositRequired() ?? false;
        }

        return match (Arr::get($data, 'payment_details.gateway')) {
            Appointment::PAYPAL_PAYMENT_METHOD        => $company->isPaypalEnabled(),
            Appointment::AUTHORIZE_NET_PAYMENT_METHOD => $company->isAuthorizeNetEnabled(),
            Appointment::STRIPE_PAYMENT_METHOD        => $company->isStripeEnabled(),
            default                                   => throw new AppointmentException('The Payment Gateway is required')
        };
    }

    /**
     * Authorization and capturing of PayPal payment is implemented in PP side - we only need to validate transaction
     *
     * @param Company $company
     * @param Service $service
     * @param array $data
     * @return array
     * @throws Throwable
     */
    private function validatePayPalPayment(Company $company, Service $service, array $data): array
    {
        $gateway = new PayPalClient;
        $gateway->setApiCredentials(array_merge(config('paypal'), [config('paypal.mode') => $company->settings()->get('integrations.paypal')]));
        $gateway->getAccessToken();

        // Authorize payment
        $authorizedPaymentId = Arr::get($data, 'payment_details.purchase_units.0.payments.authorizations.0.id');
        if (!$authorizedPaymentId) throw new AppointmentException('Wrong payment details provided, please contact support. x1');

        $invoiceNumber = 'INV-' . Str::random(16);
        $amount = $service->prepay ?? $service->no_show_amount;

        // Capture payment
        $capturedPaymentResult = $gateway->captureAuthorizedPayment($authorizedPaymentId, $invoiceNumber, $amount, 'Payment is done');
        $capturedPayment = $gateway->showCapturedPaymentDetails(Arr::get($capturedPaymentResult, 'id'));
        if (Arr::get($capturedPayment, 'status') !== 'COMPLETED' || Arr::has($capturedPayment, 'error')) {
            throw new AppointmentException('Wrong payment details provided, please contact support. x2');
        }

        return [
            'datetime' => Arr::get($capturedPayment, 'create_time', Carbon::now()),
            'amount'   => Arr::get($capturedPayment, 'amount.value', $amount),
            'method'   => Appointment::PAYPAL_PAYMENT_METHOD,
        ];
    }

    /**
     * Before validation the payment from Authorize.Net should be authorized
     *
     * @param Company $company
     * @param Service $service
     * @param array $data
     * @return array
     * @throws Throwable
     * @see AppointmentController::authorizePayment()
     */
    private function validateAuthorizeNetPayment(Company $company, Service $service, array $data): array
    {
        //
        // Setup Gateways
        if ($company->is_service_fees_enabled) {
            $cbGateway = Omnipay::create('AuthorizeNetApi_Api');
            $cbGateway->setTestMode(!app()->isProduction());
            $cbGateway->setAuthName(config('authnet.api_login_id'));
            $cbGateway->setTransactionKey(config('authnet.transaction_key'));
        }

        $serviceGateway = Omnipay::create('AuthorizeNetApi_Api');
        $serviceGateway->setTestMode(!app()->isProduction());
        $serviceGateway->setAuthName($company->settings()->get('integrations.authorize_net.api_login_id'));
        $serviceGateway->setTransactionKey($company->settings()->get('integrations.authorize_net.transaction_key'));

        // Init CC
        $creditCard = new OmnipayCreditCard([
            'number'      => Arr::get($data, 'payment_details.cardNumber'),
            'expiryMonth' => Arr::get($data, 'payment_details.month'),
            'expiryYear'  => Arr::get($data, 'payment_details.year'),
            'cvv'         => Arr::get($data, 'payment_details.cardCode'),
            'address1'    => Arr::get($data, 'payment_details.address.l1'),
            'address2'    => Arr::get($data, 'payment_details.address.l2'),
            'city'        => Arr::get($data, 'payment_details.address.city'),
            'postcode'    => Arr::get($data, 'payment_details.address.postal_code'),
            'state'       => Arr::get($data, 'payment_details.address.state'),
            'country'     => Arr::get($data, 'payment_details.address.country'),
            'firstName'   => Arr::get($data, 'user.firstname'),
            'lastName'    => Arr::get($data, 'user.lastname'),
            'email'       => Arr::get($data, 'user.email'),
            'phone'       => Arr::get($data, 'user.phone'),
        ]);

        //
        // Prepare some field to linking transactions between CB and Company

        // refId field - String, up to 20 characters.
        $transactionId = 'TRN-' . Str::random(16);

        // invoiceNumber - String, up to 20 characters.
        $invoiceNumber = 'INV-' . Str::random(16);

        //
        // Authorize Service Deposit
        //
        $serviceDepositDescription = $service->payment_type === Service::PAID_PAYMENT_TYPE ?
            "No show Deposit for: $service->name" : "Deposit for: $service->name";

        $serviceDepositAuthorizeResponse = $serviceGateway->authorize([
            'amount'        => $service->prepay ?? $service->no_show_amount,
            'currency'      => 'USD',
            'transactionId' => $transactionId,
            'card'          => $creditCard,
            'invoiceNumber' => $invoiceNumber,
            'description'   => $serviceDepositDescription,
        ])->send();

        //
        // Authorize CB Service Fee
        //
        if (isset($cbGateway)) {
            $cbServiceFeeDescription = $service->payment_type === Service::PAID_PAYMENT_TYPE ?
                "No show Service Fees for: $service->name" : "Service Fees for: $company->name - $service->name";

            $cbServiceFeeAuthorizeResponse = $cbGateway->authorize([
                'amount'        => Company::CB_SERVICE_FEE_AMOUNT,
                'currency'      => 'USD',
                'transactionId' => $transactionId,
                'card'          => $creditCard,
                'invoiceNumber' => $invoiceNumber,
                'description'   => $cbServiceFeeDescription,
                'userFields'    => [
                    ['name' => 'transactionId', 'value' => $transactionId],
                    ['name' => 'invoiceNumber', 'value' => $invoiceNumber],
                ],
            ])->send();
        }

        //
        // The both transactions must be successful to continue
        if (!$serviceDepositAuthorizeResponse->isSuccessful() || (isset($cbServiceFeeAuthorizeResponse) && !$cbServiceFeeAuthorizeResponse->isSuccessful())) {
            // Void Service Deposit authorization
            if ($serviceDepositAuthorizeResponse->isSuccessful()) $serviceGateway->void(['transactionReference' => $serviceDepositAuthorizeResponse->getTransactionReference()])->send();

            // Void CB Service Fee authorization
            if (isset($cbServiceFeeAuthorizeResponse) && $cbServiceFeeAuthorizeResponse->isSuccessful()) $cbGateway->void(['transactionReference' => $cbServiceFeeAuthorizeResponse->getTransactionReference()])->send();

            throw new AppointmentException($serviceDepositAuthorizeResponse->getMessage());
        }

        //
        // Capture the both transactions
        $serviceDepositCaptureResponse = $serviceGateway->capture([
            'amount'               => $service->prepay ?? $service->no_show_amount,
            'currency'             => 'USD',
            'transactionReference' => $serviceDepositAuthorizeResponse->getTransactionReference(),
        ])->send();

        if (isset($cbGateway)) {
            $cbServiceFeeCaptureResponse = $cbGateway->capture([
                'amount'               => Company::CB_SERVICE_FEE_AMOUNT,
                'currency'             => 'USD',
                'transactionReference' => $cbServiceFeeAuthorizeResponse->getTransactionReference(),
            ])->send();
        }

        $result = [
            'datetime' => Carbon::now(),
            'amount'   => $service->prepay ?? $service->no_show_amount,
            'method'   => Appointment::AUTHORIZE_NET_PAYMENT_METHOD,
            'details'  => [
                'transactionId'  => $transactionId,
                'invoiceNumber'  => $invoiceNumber,
                'serviceDeposit' => [
                    'amount'            => $service->prepay ?? $service->no_show_amount,
                    'authorizeResponse' => $serviceDepositAuthorizeResponse->getData(),
                    'captureResponse'   => $serviceDepositCaptureResponse->getData(),
                ]
            ]
        ];

        if (isset($cbServiceFeeAuthorizeResponse) && isset($cbServiceFeeCaptureResponse)) {
            $result['details']['cbServiceFee'] = [
                'amount'            => Company::CB_SERVICE_FEE_AMOUNT,
                'authorizeResponse' => $cbServiceFeeAuthorizeResponse->getData(),
                'captureResponse'   => $cbServiceFeeCaptureResponse->getData(),
            ];
        }

        return $result;
    }

    /**
     * @param Company $company
     * @param Service $service
     * @param array $data
     * @return array
     * @throws ModelSettingsException
     * @throws ApiErrorException
     */
    private function validateStripePayment(Company $company, Service $service, array $data): array
    {
        $stripe = Cashier::stripe(['api_key' => $company->settings()->get('integrations.stripe.secret_key')]);
        $paymentIntent = $stripe->paymentIntents->retrieve(Arr::get($data, 'payment_details.id'));
        $paymentIntent = $paymentIntent->capture();

        if (
            Arr::get($paymentIntent, 'status') !== 'succeeded' ||
            is_null($paymentIntent->metadata->appointment_created) ||
            $paymentIntent->metadata->appointment_created === true
        ) {
            throw new AppointmentException('Wrong payment details provided, please contact support');
        }

        // Mark this payment intent as handled
        $metadata = $paymentIntent->metadata->toArray();
        Arr::set($metadata, 'appointment_created', true);
        $stripe->paymentIntents->update($paymentIntent->id, ['metadata' => $metadata]);

        try {
            $stripeAddress = $paymentIntent->charges?->last()?->billing_details?->address->toArray();

            // 123 Main Street, Lubec, Maine 04652, United States
            $street = implode(', ', array_filter([Arr::get($stripeAddress, 'line1'), Arr::get($stripeAddress, 'line2')]));
            $city = Arr::get($stripeAddress, 'city');
            $stateZip = implode(' ', array_filter([Arr::get($stripeAddress, 'state'), Arr::get($stripeAddress, 'postal_code')]));
            $country = Arr::get($stripeAddress, 'country');

            $address = [
                'address' => implode(', ', array_filter([$street, $city, $stateZip, $country])),
                'l1'      => Arr::get($stripeAddress, 'line1'),
                'l2'      => Arr::get($stripeAddress, 'line2'),
                ...$stripeAddress
            ];
        } catch (Throwable) {
        }


        return [
            'datetime' => Carbon::now(),
            'amount'   => $service->prepay ?? $service->no_show_amount,
            'method'   => Appointment::STRIPE_PAYMENT_METHOD,
            'details'  => ['paymentIntent' => $paymentIntent],
            'address'  => $address ?? [],
        ];
    }

    /**
     * @param Company $company
     * @param array $data
     * @return bool
     */
    private function isSlotOccupiedByAnotherCompany(Company $company, array $data): bool
    {
        $startAt = Carbon::parse(Arr::get($data, 'start_at'))->utc();
        $endAt = Carbon::parse(Arr::get($data, 'end_at'))->utc();

        return (boolean)Appointment::active()
            ->whereHas('company')
            ->whereNot('company_id', $company->id)
            ->whereIn('employee_id', Employee::find($data['employee_id'])->user->employees->pluck('id'))
            // Get intersections with another appointments
            ->where(fn($q) => $q->whereRaw("tsrange(start_at, end_at) && tsrange('$startAt', '$endAt')"))
            ->count();
    }
}
