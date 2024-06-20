<?php

namespace App\Services;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

final class CalendarService
{
    public function make(Request $request, Builder|Relation $builder): Collection
    {
        if ($request->has('filters')) $builder = $builder->filters($request->get('filters'));

        $calendarMode = $request->get('mode', 'month');
        $date = ($request->get('date')) ? CarbonImmutable::parse($request->get('date')) : CarbonImmutable::now();

        return $builder->calendar('start_at', $calendarMode, $date)->get();
    }
}
