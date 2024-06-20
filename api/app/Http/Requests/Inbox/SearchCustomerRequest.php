<?php

namespace App\Http\Requests\Inbox;

use Illuminate\Foundation\Http\FormRequest;

class SearchCustomerRequest extends FormRequest
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
            'email' => [
                'required_without:phone',
                'email:rfc',
            ],
            'phone' => [
                'required_without:email',
                'min:9',
                'max:255',
            ],
        ];
    }
}
