<?php

namespace App\Http\Requests\Customer;

use App\Models\Customer;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Validator;

class StoreCustomerRequest extends FormRequest
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
            'firstname'           => ['required', 'string', 'max:255'],
            'lastname'            => ['required', 'string', 'max:255'],
            'email'               => [
                Rule::requiredIf(is_null($this->get('phone'))),
                'nullable',
                'email:rfc',
                Rule::unique('customers')
                    ->where(fn($query) => $query->where('company_id', auth()->user()->contextCompany->id)),
            ],
            'phone'               => [
                Rule::requiredIf(is_null($this->get('email'))),
                'nullable',
                'numeric',
                Rule::unique('customers')
                    ->where(fn($query) => $query->where('company_id', auth()->user()->contextCompany->id)),
            ],
            'birth_date'          => ['nullable', 'date'],
            'note'                => ['nullable', 'string'],
            'address.address'     => ['nullable', 'string'],
            'address.city'        => ['nullable', 'string', 'max:255'],
            'address.state'       => ['nullable', 'string', 'max:255'],
            'address.country'     => ['nullable', 'string', 'max:255'],
            'address.postal_code' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * Configure the validator instance.
     *
     * @param Validator $validator
     * @return void
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $customer= Customer::withTrashed()
                ->where('company_id', auth()->user()->contextCompany->id)
                ->where(function ($query) {
                    $query
                        ->when($this->get('email'), function ($query) {
                            $query->orWhere('email', $this->get('email'));
                        })
                        ->when($this->get('phone'), function ($query) {
                            $query->orWhere('phone', $this->get('phone'));
                        });
                })
                ->first();

            if ($customer && $customer->trashed()) {
                $errors = [];
                $message = 'The customer exists in the app but deactivated, please reach support team via support widget.';

                if ($this->get('email')) $errors['email'] = $message;
                if ($this->get('phone')) $errors['phone'] = $message;

                throw ValidationException::withMessages($errors);
            }
        });
    }
}
