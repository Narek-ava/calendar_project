<?php

namespace App\Http\Requests\Mailbox;

use Illuminate\Foundation\Http\FormRequest;

class StoreMailboxRequest extends FormRequest
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
            'email' => ['required', 'string', 'email', 'max:128'],
            'name'  => ['required', 'string', 'max:40'],
        ];
    }
}
