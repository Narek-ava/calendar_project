<?php

namespace App\Http\Requests\Service;

use App\Models\Service;
use Illuminate\Database\Query\Builder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ServiceOrderingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return auth()->user()->can('service.update');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules(): array
    {
        return [
            'ordering'                 => 'required|array',
            'ordering.*.id'            => [
                'required', 'numeric',
                Rule::exists(Service::class, 'id'),
                function ($attribute, $value, $fail) {
                    if (!auth()->user()->contextCompany->services->firstWhere('id', $value)) {
                        $fail('The ' . $attribute . ' is invalid.');
                    }
                },
            ],
            'ordering.*.sorting_order' => 'required|numeric',
        ];
    }
}
