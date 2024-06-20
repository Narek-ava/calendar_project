<?php

namespace App\Http\Requests\Account;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EmployeeSettingsRequest extends FormRequest
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

            'settings.calendar.cell_duration'              => ['required', 'numeric', Rule::in([30, 60])],
            'settings.calendar.show_scheduled_staff'       => ['required', 'boolean'],
            'settings.calendar.show_canceled_appointments' => ['required', 'boolean'],
            'settings.calendar.selected_location_id'       => ['required', 'numeric'],

            'settings.calendar.locations' => ['nullable', 'array', 'present'],

            'settings.calendar.locations.*.id' => ['required', 'numeric'],

            'settings.calendar.locations.*.services'   => ['nullable', 'array', 'present'],
            'settings.calendar.locations.*.services.*' => ['numeric'],

            'settings.calendar.locations.*.employees'   => ['nullable', 'array', 'present'],
            'settings.calendar.locations.*.employees.*' => ['numeric'],
        ];
    }
}
