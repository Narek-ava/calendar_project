<?php

namespace App\Http\Requests\Public\Appointment;

use App\Models\Appointment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AppointmentCustomerRequest extends FormRequest
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
            'user.firstname' => ['required', 'string', 'max:255'],
            'user.lastname'  => ['required', 'string', 'max:255'],
            'user.email'     => [
                Rule::requiredIf(is_null($this->input('user.phone'))),
                'nullable',
                'email:rfc,dns',
            ],
            'user.phone'     => [
                Rule::requiredIf(is_null($this->input('user.email'))),
                'nullable',
//                'phone:US',
                'numeric'
            ],
            'service_id'     => ['required', 'numeric'],
            'images'         => ['nullable', 'array', 'max:' . Appointment::MAX_IMAGES]
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
