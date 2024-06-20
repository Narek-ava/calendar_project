<?php

namespace App\Http\Requests\Account;

use App\Models\Google\GoogleCalendar;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SelectGoogleCalendarsRequest extends FormRequest
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
            'calendars'                     => ['required', 'array'],
            'calendars.*.id'                => ['required',
                Rule::exists(GoogleCalendar::class, 'id'),
                fn($attribute, $value, $fail) => $this->googleAccount->calendars()->findOr($value, 'id', fn() => $fail("The $attribute is not related to the selected account.")),
            ],
            'calendars.*.accounting_events' => ['required', 'boolean', function ($attribute, $value, $fail) {
                if (!in_array(true, $this->input('calendars.*.accounting_events'))) $fail('At least one calendar should be selected.');
            }],
        ];
    }
}
