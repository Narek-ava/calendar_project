<?php

namespace App\Http\Requests\Exports;

use Illuminate\Foundation\Http\FormRequest;
use Spatie\ValidationRules\Rules\Delimited;

class CustomersExportRequest extends FormRequest
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
            'filters'           => ['nullable', 'array'],
            'filters.date_from' => ['nullable', 'date'],
            'filters.date_to'   => ['nullable', 'date'],
        ];
    }
}
