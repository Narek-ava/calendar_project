<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\Appointment\AppointmentCustomerRequest;
use App\Http\Requests\Public\Appointment\SlotAppointmentRequest;
use App\Http\Requests\Public\Appointment\StoreAppointmentRequest;
use App\Http\Requests\Public\Appointment\TvaTokenRequest;
use App\Http\Requests\Public\Appointment\UpdateAppointmentRequest;
use App\Http\Requests\Public\Appointment\UpdateAppointmentStatusRequest;
use App\Http\Resources\Public\AppointmentResource;
use App\Http\Resources\Public\SlotResource;
use App\Models\Appointment;
use App\Models\Company;
use App\Models\Service;
use App\Services\AppointmentService;
use App\Services\CustomerService;
use App\Services\Exceptions\AppointmentException;
use Arr;
use Glorand\Model\Settings\Exceptions\ModelSettingsException;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Contracts\Routing\ResponseFactory;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Laravel\Cashier\Cashier;
use Throwable;
use Twilio\Jwt\AccessToken;
use Twilio\Jwt\Grants\VideoGrant;
use function Sentry\captureException;

class AppointmentController extends Controller
{
    /**
     * @param AppointmentService $appointmentService
     * @param CustomerService $customerService
     */
    public function __construct(
        private readonly AppointmentService $appointmentService,
        private readonly CustomerService    $customerService
    )
    {
    }

    public function store(StoreAppointmentRequest $request, Company $company): Response
    {
        try {
            $appointment = $this->appointmentService->customerCreateAppointment($request, $company, $request->validated());

            return response([
                'message'     => 'Appointment was successfully created',
                'appointment' => new AppointmentResource($appointment->load([
                    'company',
                    'employeeTrashed.user',
                    'serviceTrashed.images',
                    'locationTrashed',
                    'customerTrashed',
                    'images',
                ]))
            ]);
        } catch (Throwable $e) {
            captureException($e);
            return response(['message' => $e->getMessage()], 400);
        }
    }

    public function show(Request $request, Company $company, Appointment $appointment): AppointmentResource
    {
        return new AppointmentResource($appointment->load([
            'company',
            'employeeTrashed.user',
            'serviceTrashed.images',
            'locationTrashed',
            'images',
            //
            'customerTrashed.appointments' => function ($query) use ($appointment) {
                $query
                    ->where('company_id', $appointment->company_id)
                    ->with([
                        'employeeTrashed.user',
                        'serviceTrashed.images',
                        'locationTrashed',
                        'images',
                    ]);
            }
        ]));
    }

    public function update(UpdateAppointmentRequest $request, Company $company, Appointment $appointment): Response
    {
        try {
            $appointment = $this->appointmentService->customerUpdateAppointment($appointment, $request->validated());

            return response([
                'message'     => 'Appointment was successfully updated',
                'appointment' => new AppointmentResource($appointment->load([
                    'company',
                    'employeeTrashed.user',
                    'serviceTrashed.images',
                    'locationTrashed',
                    'customerTrashed',
                    'images',
                ]))
            ]);
        } catch (Throwable $e) {
            captureException($e);
            return response(['message' => $e->getMessage()], 400);
        }
    }

    /**
     * @param UpdateAppointmentStatusRequest $request
     * @param Company $company
     * @param Appointment $appointment
     * @return Response
     */
    public function status(UpdateAppointmentStatusRequest $request, Company $company, Appointment $appointment): Response
    {
        if (!$appointment->isInReschedulingOrCancelingInterval()) {
            throw new AppointmentException('Canceling interval is over for the service of this appointment');
        }

        $this->appointmentService->setStatus($appointment, $request->validated());
        return response(['message' => 'Status updated']);
    }

    public function slots(SlotAppointmentRequest $request, Company $company): AnonymousResourceCollection
    {
        return SlotResource::collection($this->appointmentService->availableSlots(
            $company,
            $request->get('date'),
            $request->get('service'),
            $request->get('location'),
            $request->get('employee')
        ));
    }

    /**
     * @param TvaTokenRequest $request
     * @return Response|Application|ResponseFactory
     */
    public function tvaToken(TvaTokenRequest $request): Response|Application|ResponseFactory
    {
        // Create access token, which we will serialize and send to the client
        $token = new AccessToken(
            config('twilio.account_sid'),
            config('twilio.api_key'),
            config('twilio.api_secret'),
            3600,
            $request->input('user_identity')
        );

        // Add grant to token
        $token->addGrant(
            (new VideoGrant())->setRoom($request->input('room_name'))
        );

        // render token to string
        return response(['room_type' => 'go', 'token' => $token->toJWT()]);
    }

    /**
     * @throws ModelSettingsException
     */
    public function stripePaymentIntent(Request $request, Company $company): Response|array|Application|ResponseFactory
    {
        $response = ['result' => false, 'client_secret' => null];
        if (!$company->isStripeEnabled()) return response($response);

        try {
            $service = $company->services()->findOrFail($request->input('service_id'));

            $intent = Cashier::stripe(['api_key' => $company->settings()->get('integrations.stripe.secret_key')])
                ->paymentIntents->create([
                    // https://stripe.com/docs/api/payment_intents/object?lang=php#payment_intent_object-amount
                    // In cents
                    'amount'   => ($service->prepay ?? $service->no_show_amount) * 100,
                    'currency' => 'usd',
                    // Verify your integration in this guide by including this parameter
                    'metadata' => ['integration_check' => 'accept_a_payment', 'appointment_created' => false],
                    'capture_method' => 'manual',
                ]);

            Arr::set($response, 'result', true);
            Arr::set($response, 'client_secret', $intent->client_secret);

            return $response;
        } catch (Throwable $e) {
            captureException($e);
            return response(['message' => !app()->isProduction() ? $e->getMessage() : 'Wrong payment details provided, please contact support'], 400);
        }
    }

    /**
     * @param AppointmentCustomerRequest $request
     * @param Company $company
     * @return Response
     * @throws ModelSettingsException
     */
    public function validateCustomerInfo(AppointmentCustomerRequest $request, Company $company): Response
    {
        $service = $company->services()->findOrFail($request->validated('service_id'));
        $customer = $this->customerService->getCustomer($company, $request->validated('user'));
        if ($customer && $customer->trashed()) throw new AppointmentException('Your account has been deactivated, please contact support.');

        $response = array_merge(
            $request->validated(),
            [
                'deposit'         => [
                    'required' => $service->payment_type === Service::PREPAY_PAYMENT_TYPE,
                    'amount'   => $service->prepay
                ],
                'no_show_deposit' => [
                    'required' =>
                        $company->settings()->get('appointments.no_show_deposit.enabled') &&
                        ($customer?->isNoShowDepositRequired() ?? false) &&
                        $service->payment_type === Service::PAID_PAYMENT_TYPE,
                    'amount'   => $service->no_show_amount
                ]
            ]
        );

        return response($response);
    }
}
