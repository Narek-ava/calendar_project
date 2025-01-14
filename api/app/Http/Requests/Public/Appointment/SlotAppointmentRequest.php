<?php

namespace App\Http\Requests\Public\Appointment;

use Illuminate\Foundation\Http\FormRequest;

class SlotAppointmentRequest extends FormRequest
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
            'date'     => ['required', 'date'],
            'service'  => ['required'],
            'location' => ['required'],
            'employee' => ['sometimes'],
        ];
    }
}
