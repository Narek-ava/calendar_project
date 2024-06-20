<?php

namespace App\Http\Requests\Appointment;

use App\Models\Appointment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAppointmentPaymentsRequest extends FormRequest
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
            'payments'            => ['nullable', 'array'],
            'payments.*.datetime' => ['required', 'date'],
            'payments.*.reason'   => ['required', 'string', Rule::in(Appointment::$paymentReasons)],
            'payments.*.amount'   => ['required', 'numeric', 'min:0.01'],
            'payments.*.method'   => ['required', 'string', Rule::in(Appointment::$paymentMethods)],
            'payments.*.details'  => ['nullable', 'sometimes'],
        ];
    }
}
