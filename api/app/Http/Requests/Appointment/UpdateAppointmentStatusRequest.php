<?php

namespace App\Http\Requests\Appointment;

use App\Models\Appointment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAppointmentStatusRequest extends FormRequest
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
            'status'        => ['required', 'string', Rule::in(Appointment::$statuses)],
            'cancel_reason' => [
                Rule::requiredIf(fn() => $this->get('status') === Appointment::CANCELED_STATUS),
                'string',
                Rule::in(Appointment::$cancelReasons)
            ],
        ];
    }
}
