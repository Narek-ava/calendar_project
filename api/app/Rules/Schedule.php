<?php

namespace App\Rules;

use Carbon\CarbonImmutable;
use Closure;
use Illuminate\Contracts\Validation\InvokableRule;
use Illuminate\Contracts\Validation\ValidatorAwareRule;
use Illuminate\Support\Arr;
use Illuminate\Translation\PotentiallyTranslatedString;
use Illuminate\Validation\Validator;

class Schedule implements InvokableRule, ValidatorAwareRule
{
    /**
     * The validator instance.
     *
     * @var Validator
     */
    protected Validator $validator;

    /**
     * Set the current validator.
     *
     * @param Validator $validator
     * @return $this
     */
    public function setValidator($validator): static
    {
        $this->validator = $validator;

        return $this;
    }

    /**
     * Run the validation rule.
     *
     * @param string $attribute
     * @param mixed $value
     * @param Closure(string): PotentiallyTranslatedString $fail
     * @return void
     */
    public function __invoke($attribute, $value, $fail): void
    {
        foreach ($value as $dayIndex => $day) {
            if (!Arr::get($day, 'enable')) continue;

            $start = CarbonImmutable::parse(Arr::get($day, 'start'))->setDateFrom();
            $end = CarbonImmutable::parse(Arr::get($day, 'end'))->setDateFrom();
            if ($start->greaterThanOrEqualTo($end)) $this->validator->errors()->add("schedule.$dayIndex.end", "End time must be after start time.");
        }
    }
}
