<?php

namespace App\Http\Requests\Public\Appointment;

use App\Models\Appointment;
use DateTimeZone;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreAppointmentRequest extends FormRequest
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
        $addressRequired = $this->input('payment_details.gateway') === Appointment::AUTHORIZE_NET_PAYMENT_METHOD;

        return [
            'user.firstname'   => ['required', 'string', 'max:255'],
            'user.lastname'    => ['required', 'string', 'max:255'],
            'user.email'       => [
                Rule::requiredIf(is_null($this->input('user.phone'))),
                'nullable',
                'email:rfc,dns',
            ],
            'user.phone'       => [
                Rule::requiredIf(is_null($this->input('user.email'))),
                'nullable',
//                'phone:US',
                'numeric'
            ],
            'user.birth_date'  => ['nullable', 'date'],
            'employee_id'      => ['sometimes', 'numeric'],
            'location_id'      => ['required', 'numeric'],
            'service_id'       => ['required', 'numeric'],
            'background_color' => ['sometimes', 'string'],
            'text_color'       => ['sometimes', 'string'],
            'start_at'         => ['required', 'date'],
            'end_at'           => ['required', 'date'],
            'time_zone'        => ['nullable', 'string', Rule::in(DateTimeZone::listIdentifiers(DateTimeZone::ALL_WITH_BC))],
            'note'             => ['nullable', 'string'],
            'images'           => ['nullable', 'array', 'max:' . Appointment::MAX_IMAGES],

            'payment_details'         => ['sometimes'],
            'payment_details.gateway' => ['sometimes', 'required', 'string', Rule::in(Appointment::$paymentMethods)],

            'payment_details.address'             => ['sometimes', 'array'],
            'payment_details.address.address'     => [Rule::requiredIf($addressRequired), 'string'],
            'payment_details.address.l1'          => [Rule::requiredIf($addressRequired), 'string'],
            'payment_details.address.l2'          => ['nullable', 'string'],
            'payment_details.address.city'        => [Rule::requiredIf($addressRequired), 'string'],
            'payment_details.address.state'       => [Rule::requiredIf($addressRequired), 'string'],
            'payment_details.address.country'     => [Rule::requiredIf($addressRequired), 'string'],
            'payment_details.address.postal_code' => [Rule::requiredIf($addressRequired), 'alpha_dash'],
        ];
    }

    /**
     * Prepare the data for validation.
     *
     * @return void
     */
    protected function prepareForValidation(): void
    {
        if ($this->input('user.email')) {
            $this->merge(['user' => [...$this->input('user'), 'email' => Str::lower($this->input('user.email'))]]);
        }
    }
}
