<?php

namespace Modules\TwilioSmsIntegration\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SaveSettingsRequest extends FormRequest
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
//            'enabled'               => ['required', 'boolean'],
            'account_sid'           => ['required', 'string'],
            'auth_token'            => ['required', 'string'],
            'messaging_service_sid' => ['required', 'string'],
        ];
    }
}
