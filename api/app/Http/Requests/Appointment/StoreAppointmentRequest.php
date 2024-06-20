<?php

namespace App\Http\Requests\Appointment;

use App\Models\Appointment;
use Illuminate\Foundation\Http\FormRequest;
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
        return [
            'type'         => ['required', 'string', Rule::in(Appointment::$types)],
            'employee_id'  => ['required', 'numeric'],
            'location_id'  => ['required', 'numeric'],
            'service_id'   => [Rule::requiredIf($this->get('type') === Appointment::APPOINTMENT_TYPE), 'numeric'],
            'customer_id'  => [Rule::requiredIf($this->get('type') === Appointment::APPOINTMENT_TYPE), 'numeric'],
            'start_at'     => ['required', 'date'],
            'end_at'       => ['required', 'date'],
            'note'         => ['nullable', 'string'],
            'images'       => ['nullable', 'array', 'max:' . Appointment::MAX_IMAGES],
            'private_note' => ['nullable', 'string'],

            'is_notifications_enabled' => ['sometimes', 'boolean'],

            ...(new UpdateAppointmentPaymentsRequest())->rules()
        ];
    }
}
