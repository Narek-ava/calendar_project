<?php

namespace App\Http\Requests\Mailbox;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMailboxRequest extends FormRequest
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
            'name'             => 'required|string|max:40',
            'email'            => 'required|string|email|max:128',
            'aliases'          => 'nullable|string|max:255',
            'from_name'        => 'required|integer',
            'from_name_custom' => 'nullable|string|max:128',
            'ticket_status'    => 'required|integer',
            'template'         => 'required|integer',
            'ticket_assignee'  => 'required|integer',
            'out_method'       => 'integer',
            'out_server'       => 'string|max:255',
            'out_port'         => 'integer',
            'out_username'     => 'nullable|string|max:100',
            'out_password'     => 'nullable|string|max:255',
            'out_encryption'   => 'integer',
            'in_server'        => 'string',
            'in_port'          => 'integer',
            'in_username'      => 'string',
            'in_password'      => 'string',
            'in_encryption'    => 'integer',
            'in_validate_cert' => ['sometimes'],
            'users'            => ['array', 'nullable'],
            'auto_bcc'         => 'nullable|string',
        ];
    }
}
