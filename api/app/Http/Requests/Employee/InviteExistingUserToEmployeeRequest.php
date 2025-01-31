<?php

namespace App\Http\Requests\Employee;

use App\Models\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InviteExistingUserToEmployeeRequest extends FormRequest
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
            'email' => ['required', 'email', 'exists:users,email'],
            'role'  => ['required', 'string', Rule::in([
                Role::ADMIN_ROLE,
                Role::MANAGER_ROLE,
                Role::PROVIDER_ROLE,
                Role::FRONTDESK_ROLE,
            ])],
        ];
    }
}
