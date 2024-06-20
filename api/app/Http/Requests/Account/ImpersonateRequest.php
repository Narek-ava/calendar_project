<?php

namespace App\Http\Requests\Account;

use Illuminate\Foundation\Http\FormRequest;

class ImpersonateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        $manager = app('impersonate');
        if (!$manager->isImpersonating()) return auth()->user()->canImpersonate();

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
            'company_id' => ['required', 'exists:companies,id'],
        ];
    }
}
