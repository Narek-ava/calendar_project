<?php

namespace App\Http\Requests\Exports;

use App\Models\Appointment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Spatie\ValidationRules\Rules\Delimited;

class AppointmentsReportRequest extends FormRequest
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
            'filters'             => ['nullable', 'array'],
            'filters.date_from'   => ['nullable', 'date'],
            'filters.date_to'     => ['nullable', 'date'],
            'filters.locations'   => ['required', 'string', new Delimited('numeric')],
            'filters.employees'   => ['nullable', 'string', new Delimited('numeric')],
            'filters.report_type' => ['required', Rule::in(Appointment::$reportTypes)],
        ];
    }
}
