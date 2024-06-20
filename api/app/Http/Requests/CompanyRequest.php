<?php

namespace App\Http\Requests;

use App\Http\Requests\Company\CompanySettingsRequest;
use Illuminate\Foundation\Http\FormRequest;

class CompanyRequest extends FormRequest
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
            'name'                => ['required', 'string', 'max:255'],
            'email'               => ['nullable', 'email'],
            'phone'               => ['nullable', 'string', 'max:255'],
            'site'                => ['nullable', 'string', 'max:255'],
            'address.address'     => ['required', 'string'],
            'address.city'        => ['required', 'string', 'max:255'],
            'address.state'       => ['required', 'string', 'max:255'],
            'address.country'     => ['required', 'string', 'max:255'],
            'address.postal_code' => ['required', 'string', 'max:255'],
            'address.l1'          => ['nullable', 'string'],
            'address.l2'          => ['nullable', 'string'],
            'logo'                => ['nullable', 'string'],
        ];
    }
}
