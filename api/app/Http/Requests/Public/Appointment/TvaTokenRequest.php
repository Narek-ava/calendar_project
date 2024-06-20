<?php

namespace App\Http\Requests\Public\Appointment;

use Illuminate\Foundation\Http\FormRequest;

class TvaTokenRequest extends FormRequest
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
            'create_conversation' => ['required', 'boolean'],
            'room_name'           => ['required', 'string'],
            'user_identity'       => ['required', 'string'],
        ];
    }
}
