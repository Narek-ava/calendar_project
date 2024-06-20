<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AccountRequest extends FormRequest
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
            'firstname'    => ['required', 'string', 'max:255'],
            'lastname'     => ['required', 'string', 'max:255'],
            'email'        => [
                'required',
                Rule::unique('users')->ignore(auth()->user()->getAuthIdentifier()),
                'email:rfc',
                'max:255',
            ],
            'phone'        => ['nullable', 'phone:US', 'max:255'],
            'avatar'       => ['nullable', 'string'],
            //            'employee.role'             => ['required', 'string', Rule::in(Role::$availableRoles)],
            //            'employee.profession_title' => ['sometimes', 'nullable', 'string', 'max:255'],
            //            'employee.locations'        => ['sometimes', 'nullable', 'array'],
            //            'employee.services'         => ['sometimes', 'nullable', 'array'],
            //            'employee.background_color' => ['nullable', 'string', 'min:6', 'max:6'],
            //            'employee.text_color'       => ['nullable', 'string', 'min:6', 'max:6'],
            //            'employee.schedule'         => ['required'],
            //            'employee.self_book'        => ['required', 'boolean'],
        ];
    }
}
