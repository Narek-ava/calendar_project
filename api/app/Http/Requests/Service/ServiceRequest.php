<?php

namespace App\Http\Requests\Service;

use App\Models\Service;
use App\Models\ServiceCategory;
use Illuminate\Database\Query\Builder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ServiceRequest extends FormRequest
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
            'service_category_id'              => [
                'required',
                Rule::exists(ServiceCategory::class, 'id')->where(function (Builder $query) {
                    return $query->where('company_id', auth()->user()->contextCompany->id);
                }),
            ],
            'name'                             => ['required'],
            'duration'                         => ['required', 'numeric', 'min:10', 'max:600'],
            'interval'                         => ['required'],
            'payment_type'                     => ['required', 'string', Rule::in(Service::$paymentTypes)],
            'price'                            => [
                Rule::requiredIf(in_array($this->get('payment_type'), [Service::PAID_PAYMENT_TYPE, Service::PREPAY_PAYMENT_TYPE])),
                'nullable',
                'numeric',
                'min:1'
            ],
            'prepay'                           => [
                Rule::requiredIf($this->get('payment_type') === Service::PREPAY_PAYMENT_TYPE),
                'nullable',
                'numeric',
                'min:1',
                'lte:price'
            ],
            'locations'                        => ['sometimes', 'nullable', 'array'],
            'employees'                        => ['sometimes', 'nullable', 'array'],
            'fixed_price'                      => ['required', 'boolean'],
            'is_private'                       => ['required', 'boolean'],
            'images'                           => ['array'],
            'description'                      => ['nullable', 'string'],
            'is_reschedule_enabled'            => ['required', 'boolean'],
            'schedule'                         => ['required', 'array', 'size:7'],
            'schedule.*.id'                    => ['required', 'numeric', 'min:0', 'max:6'],
            'schedule.*.enable'                => ['required', 'boolean'],
            'rescheduling_interval'            => [
                'numeric',
                'min:0',
                'max:2880' // minutes
            ],
            'is_virtual'                       => ['required', 'boolean'],
            'confirmation_note'                => ['nullable', 'string'],
            'advance_booking_buffer'           => ['required', 'numeric', 'min:0'],
            'is_waiver_enabled'                => ['required', 'boolean'],
        ];
    }
}
