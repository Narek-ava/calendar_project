<?php

namespace App\Http\Requests\Appointment;

use App\Models\Appointment;
use App\Models\Service;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAppointmentRequest extends FormRequest
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
            'employee_id'  => ['required', 'numeric'],
            'location_id'  => ['required', 'numeric'],
            'service_id'   => [
                Rule::requiredIf($this->appointment->type === Appointment::APPOINTMENT_TYPE),
                'numeric'
            ],
            'start_at'     => ['required', 'date'],
            'end_at'       => ['required', 'date'],
            'note'         => ['nullable', 'string'],
            'images'       => ['nullable', 'array', 'max:' . Appointment::MAX_IMAGES],
            'private_note' => ['nullable', 'string'],
            'price'        => [
                Rule::requiredIf(
                    $this->appointment->type === Appointment::APPOINTMENT_TYPE &&
                    $this->appointment->payment_type === Service::PAID_PAYMENT_TYPE
                ),
                'nullable',
                'numeric'
            ],

            'is_checked_in'            => ['sometimes', 'required', 'boolean'],
            'is_notifications_enabled' => ['sometimes', 'boolean'],

            ...(new UpdateAppointmentPaymentsRequest())->rules()
        ];
    }
}
