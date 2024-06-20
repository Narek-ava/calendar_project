<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddressRequest extends FormRequest
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
            'address'     => ['nullable', 'string'],
            'city'        => ['nullable', 'string'],
            'state'       => ['nullable', 'string'],
            'country'     => ['nullable', 'string'],
            'postal_code' => ['nullable', 'string'],
            'l1'          => ['nullable', 'string'],
            'l2'          => ['nullable', 'string'],
        ];
    }
}
