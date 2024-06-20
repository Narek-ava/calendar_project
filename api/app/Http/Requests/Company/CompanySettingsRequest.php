<?php

namespace App\Http\Requests\Company;

use App\Models\Appointment;
use App\Services\ReputationManagementService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CompanySettingsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules(): array
    {
        return [
            'settings' => ['required', 'array'],

            // Notifications
            'settings.notifications'                        => ['required', 'array'],
            'settings.notifications.enabled'                => ['required', 'boolean'],
            'settings.notifications.immediately_sms_notify' => ['required', 'boolean'],

            // Appointments
            'settings.appointments' => ['required', 'array'],

            'settings.appointments.autocomplete'          => ['required', 'array'],
            'settings.appointments.autocomplete.enabled'  => ['required', 'boolean'],
            'settings.appointments.autocomplete.interval' => [
                'required_if:settings.appointments.autocomplete.enabled,true',
                //'prohibited_if:settings.appointments.autocomplete.enabled,false',
                'nullable', 'numeric', 'min:1'
            ],

            'settings.appointments.completed_notify_customers' => ['required', 'boolean'],

            // No show deposit
            'settings.appointments.no_show_deposit'         => ['required', 'array'],
            'settings.appointments.no_show_deposit.enabled' => ['required', 'boolean'],
            'settings.appointments.no_show_deposit.percent' => ['required', 'numeric', 'min:1', 'max:100'],

            // Widget styles
            'settings.widget.primaryColor'           => ['nullable', 'string'],
            'settings.widget.textColor'              => ['nullable', 'string'],
            'settings.widget.buttonColor'            => ['nullable', 'string'],
            'settings.widget.bgPattern'              => ['nullable', 'numeric'],
            'settings.widget.widgetBgPattern'        => ['nullable', 'array'],
            'settings.widget.is_attachments_enabled' => ['required', 'boolean'],
            'settings.widget.confirmation_note'      => ['nullable', 'string'],
            'settings.widget.max_advance_booking'    => ['required', 'numeric', 'min:0'],
            'settings.widget.deposit_text'           => ['nullable', 'string'],

            // Widget link builder
            'settings.widget.link_builder'               => ['sometimes', 'nullable', 'array'],
            'settings.widget.link_builder.*.location_id' => ['nullable', 'numeric'],
            'settings.widget.link_builder.*.service_id'  => ['nullable', 'numeric'],
            'settings.widget.link_builder.*.employee_id' => ['nullable', 'numeric'],

            'settings.integrations.reputation_management' => ['required', Rule::in(ReputationManagementService::$integrations)],

            // GradeUs
            'settings.integrations.gradeus' => [
                'exclude_if:settings.integrations.reputation_management,' . ReputationManagementService::REVIEWSHAKE_INTEGRATION,
                'nullable',
                'array',
            ],
            'settings.integrations.gradeus.api_key'    => [
                'nullable',
                'required_with:settings.integrations.gradeus.profile_id',
                'string'
            ],
            'settings.integrations.gradeus.profile_id' => [
                'nullable',
                'required_with:settings.integrations.gradeus.api_key',
                'string'
            ],

            // Reviewshake
            'settings.integrations.reviewshake' => [
                'exclude_if:settings.integrations.reputation_management,' . ReputationManagementService::GRADEUS_INTEGRATION,
                'nullable',
                'array',
            ],
            'settings.integrations.reviewshake.api_key'   => [
                'nullable',
                'required_with:settings.integrations.reviewshake.subdomain',
                'required_with:settings.integrations.reviewshake.custom_domain',
                'required_with:settings.integrations.reviewshake.campaign',
                'required_with:settings.integrations.reviewshake.client',
                'required_with:settings.integrations.reviewshake.location_slug',
                'string'
            ],
            'settings.integrations.reviewshake.subdomain' => [
                'nullable',
                Rule::requiredIf(function() {
                    return $this->input('settings.integrations.reputation_management') === ReputationManagementService::REVIEWSHAKE_INTEGRATION &&
                        !is_null($this->input('settings.integrations.reviewshake.api_key')) &&
                        is_null($this->input('settings.integrations.reviewshake.custom_domain'));
                }),
                'prohibited_unless:settings.integrations.reviewshake.custom_domain,null',
                'string'
            ],
            'settings.integrations.reviewshake.custom_domain' => [
                'nullable',
                Rule::requiredIf(function() {
                    return $this->input('settings.integrations.reputation_management') === ReputationManagementService::REVIEWSHAKE_INTEGRATION &&
                        !is_null($this->input('settings.integrations.reviewshake.api_key')) &&
                        is_null($this->input('settings.integrations.reviewshake.subdomain'));
                }),
                'prohibited_unless:settings.integrations.reviewshake.subdomain,null',
                'url',
            ],
            'settings.integrations.reviewshake.campaign' => [
                'nullable',
                'required_with:settings.integrations.reviewshake.api_key',
                'string'
            ],
            'settings.integrations.reviewshake.client'        => [
                'nullable',
                'string'
            ],
            'settings.integrations.reviewshake.location_slug' => [
                'nullable',
                'string'
            ],

            // PayPal
            'settings.integrations.paypal'               => ['nullable', 'array'],
            'settings.integrations.paypal.client_id'     => [
                'nullable',
                'required_with:settings.integrations.paypal.client_secret',
                'string'
            ],
            'settings.integrations.paypal.client_secret' => [
                'nullable',
                'required_with:settings.integrations.paypal.client_id',
                'string'
            ],

            'settings.integrations.cc_processor' => ['required', Rule::in([
                Appointment::AUTHORIZE_NET_PAYMENT_METHOD,
                Appointment::STRIPE_PAYMENT_METHOD,
            ])],

            // Authorize.net
            'settings.integrations.authorize_net'                 => [
                'exclude_if:settings.integrations.cc_processor,' . Appointment::STRIPE_PAYMENT_METHOD,
                'nullable',
                'array'
            ],
            'settings.integrations.authorize_net.api_login_id'    => [
                'nullable',
                'required_with:settings.integrations.authorize_net.transaction_key',
                'string'
            ],
            'settings.integrations.authorize_net.transaction_key' => [
                'nullable',
                'required_with:settings.integrations.authorize_net.api_login_id',
                'string'
            ],

            // Stripe
            'settings.integrations.stripe'                 => [
                'exclude_if:settings.integrations.cc_processor,' . Appointment::AUTHORIZE_NET_PAYMENT_METHOD,
                'nullable',
                'array'
            ],
            'settings.integrations.stripe.secret_key'      => [
                'nullable',
                'required_with:settings.integrations.stripe.publishable_key',
                'string'
            ],
            'settings.integrations.stripe.publishable_key' => [
                'nullable',
                'required_with:settings.integrations.stripe.secret_key',
                'string'
            ],

            // Twilio
            'settings.integrations.twilio'                 => ['nullable', 'array'],
            'settings.integrations.twilio.auth_token'      => [
                'nullable',
                'required_with:settings.integrations.twilio.account_sid',
                'string'
            ],
            'settings.integrations.twilio.account_sid' => [
                'nullable',
                'required_with:settings.integrations.twilio.auth_token',
                'string'
            ],
        ];
    }
}
