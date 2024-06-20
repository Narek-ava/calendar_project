<?php

namespace App\Http\Requests;

use App\Rules\Schedule;
use DateTimeZone;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LocationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'name'                => ['required', 'string', 'max:255'],
            'phone'               => ['nullable', 'string', 'max:255'],
            'twilio_phone'        => ['nullable', 'string', 'max:255'],
            'time_zone'           => [
                'required',
                'string',
                Rule::in(array_merge(
                    DateTimeZone::listIdentifiers(DateTimeZone::UTC),
                    DateTimeZone::listIdentifiers(DateTimeZone::PER_COUNTRY, 'US')
                ))
            ],
            'address.address'     => ['nullable', 'string'],
            'address.l1'          => ['nullable', 'string'],
            'address.l2'          => ['nullable', 'string'],
            'address.city'        => ['nullable', 'string', 'max:255'],
            'address.state'       => ['nullable', 'string', 'max:255'],
            'address.country'     => ['nullable', 'string', 'max:255'],
            'address.postal_code' => ['nullable', 'string', 'max:255'],
            'schedule'            => ['required', 'array', 'size:7', new Schedule],
            'schedule.*.id'       => ['required', 'numeric', 'min:0', 'max:6'],
            'schedule.*.enable'   => ['required', 'boolean'],
            'schedule.*.start'    => ['required', 'date'],
            'schedule.*.end'      => ['required', 'date'],
        ];
    }
}
