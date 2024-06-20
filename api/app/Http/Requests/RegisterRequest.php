<?php

namespace App\Http\Requests;

use App\Models\User;
use App\Services\SubscriptionLimitsService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Rules\Password;

class RegisterRequest extends FormRequest
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
            'stripe_price_id' => ['required', 'string'],

            'firstname' => ['required', 'string', 'max:255'],
            'lastname'  => ['required', 'string', 'max:255'],
            'email'     => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class),
            ],
            'password'  => ['required', 'string', new Password()],

            'company'                   => ['required', 'array'],
            'company.name'              => ['required', 'string', 'min:1'],
            'company.subscription_type' => ['required', 'string', Rule::in(SubscriptionLimitsService::$types)],
            'company.time_zone'         => ['sometimes', 'string'],

            'address'             => ['required', 'array'],
            'address.address'     => ['string', 'nullable'],
            'address.city'        => ['required', 'string', 'max:255'],
            'address.state'       => ['required', 'string', 'max:255'],
            'address.country'     => ['required', 'string', 'max:255'],
            'address.postal_code' => ['required', 'string', 'max:255'],
            'address.l1'          => ['nullable', 'string'],
            'address.l2'          => ['nullable', 'string'],
            'with_trial'          => ['sometimes', 'boolean'],
        ];
    }

    /**
     * Prepare the data for validation.
     *
     * @return void
     */
    protected function prepareForValidation(): void
    {
        $this->merge(['email' => Str::lower($this->email)]);
    }
}
