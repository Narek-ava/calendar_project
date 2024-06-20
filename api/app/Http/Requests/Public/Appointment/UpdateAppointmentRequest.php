<?php

namespace App\Http\Requests\Public\Appointment;

use DateTimeZone;
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
            'start_at'  => ['required', 'date'],
            'end_at'    => ['required', 'date'],
            'time_zone' => ['nullable', 'string', Rule::in(DateTimeZone::listIdentifiers(DateTimeZone::ALL_WITH_BC))],
        ];
    }
}
