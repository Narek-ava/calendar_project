<?php

namespace App\Traits\Nova;

use ArrayAccess;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

trait WithFormRequestRules
{
    /**
     * @param string $fieldName
     * @return array|ArrayAccess|mixed
     */
    public function getRules(string $fieldName): mixed
    {
        if (!$this->formRequest) return [];
        $formRequest = $this->formRequest::createFrom(request());

        $fieldName = Str::lower($fieldName);

        return Arr::get($formRequest->rules(), $fieldName);
    }
}
