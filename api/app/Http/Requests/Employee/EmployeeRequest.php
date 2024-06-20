<?php

namespace App\Http\Requests\Employee;

use App\Models\Role;
use App\Rules\Schedule;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class EmployeeRequest extends FormRequest
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
        $storeRules = [
            'user.firstname' => ['required', 'string', 'max:255'],
            'user.lastname'  => ['required', 'string', 'max:255'],
            'user.email'     => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'user.phone'     => ['sometimes', 'nullable', 'string', 'max:255'],
        ];

        $updateRules = [
            'avatar'           => ['sometimes', 'nullable', 'string'],
            'role'             => ['required', 'string', Rule::in(Role::$availableRoles)],
            'profession_title' => ['sometimes', 'nullable', 'string', 'max:255'],
            'locations'        => ['sometimes', 'nullable', 'array'],
            'services'         => ['sometimes', 'nullable', 'array'],
            'background_color' => ['nullable', 'string', 'min:6', 'max:6'],
            'text_color'       => ['nullable', 'string', 'min:6', 'max:6'],

            'schedule'          => [
                'exclude_if:settings.widget.use_location_schedule,true',
                'required',
                'array',
                'size:7',
                new Schedule
            ],
            'schedule.*.id'     => ['required', 'numeric', 'min:0', 'max:6'],
            'schedule.*.enable' => ['required', 'boolean'],
            'schedule.*.start'  => ['required', 'date'],
            'schedule.*.end'    => ['required', 'date'],

            'self_book'         => ['required', 'boolean'],

            'is_shifts_enabled' => ['required', 'boolean'],
            'shifts'          => [Rule::requiredIf($this->get('is_shifts_enabled')), 'array'],
            'shifts.*.opened' => ['boolean'],
            'shifts.*.start'  => ['date', 'distinct'],
            'shifts.*.end'    => ['date', 'distinct', 'after:shifts.*.start'],

            'settings.widget.use_location_schedule'    => ['required', 'boolean'],
            'settings.widget.accounting_google_events' => ['sometimes', 'boolean'],
        ];

        if ($this->isMethod('POST')) return array_merge($storeRules, $updateRules);

        return $updateRules;
    }

    /**
     * Configure the validator instance.
     *
     * @param Validator $validator
     * @return void
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if (!$this->validated('is_shifts_enabled')) return;

            foreach ($this->validated('shifts', []) as $shiftIndex => $shift) {
                $shift = $this->parseShift($shift);
                $shiftPosition = $shiftIndex + 1;

                // Start and end time validate
                if (
                    Arr::get($shift, 'firstDateStart')->greaterThanOrEqualTo(Arr::get($shift, 'firstDateEnd')) ||
                    Arr::get($shift, 'secondDateStart')->greaterThanOrEqualTo(Arr::get($shift, 'secondDateEnd'))
                ) {
                    $validator->errors()->add("shifts.$shiftIndex.end", "end time must be after start time.");
                }

                // Check periods overlapping
                foreach ($this->validated('shifts') as $foreignShiftIndex => $foreignShift) {
                    if ($foreignShiftIndex === $shiftIndex) continue;

                    if (Arr::get($shift, 'period')->overlaps(Arr::get($this->parseShift($foreignShift), 'period'))) {
                        $foreignShiftPosition = $foreignShiftIndex + 1;

                        $validator->errors()->add("shifts.$shiftIndex.start", "shift overlaps with $foreignShiftPosition shift.");
                        $validator->errors()->add("shifts.$foreignShiftIndex.start", "shift overlaps with $shiftPosition shift.");
                    }
                }
            }
        });
    }

    /**
     * @param array $shift
     * @return array
     */
    private function parseShift(array $shift): array
    {
        $start = CarbonImmutable::parse(Arr::get($shift, 'start'));
        $end = CarbonImmutable::parse(Arr::get($shift, 'end'));

        $firstDateStart = $start;
        $firstDateEnd = $start->setTimeFrom($end);

        $secondDateStart = $end->setTimeFrom($start);
        $secondDateEnd = $end;

        $period = $start->daysUntil($end);

        return get_defined_vars();
    }
}
