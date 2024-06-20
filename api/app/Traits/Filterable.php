<?php

namespace App\Traits;

use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;

trait Filterable
{
    public function scopeFilters(Builder $query, array $relations): Builder
    {
        collect($relations)->each(function (string|null $searchQuery, string $relation) use ($query) {

            if (!trim($searchQuery)) return $query;

            if ($relation === 'customerInfo') {
                $query->whereHas('customer', function (Builder $query) use ($searchQuery) {
                    $query->where(function (Builder $query) use ($searchQuery) {
                        foreach (['firstname', 'lastname', 'email'] as $column) {
                            foreach (explode(' ', $searchQuery) as $word) {
                                $word = trim($word);
                                if (strlen($word)) $query->orWhere($column, 'ilike', "%$word%");
                            }
                        }

                        $phoneNumber = trim(preg_replace('/\D/', '', $searchQuery));
                        if (strlen($phoneNumber)) $query->orWhere('phone', 'ilike', "%$phoneNumber%");
                    });
                });
            } else {
                if ($searchQuery) {
                    $query->whereHas($relation, function (Builder $query) use ($searchQuery) {
                        $query->whereIn('id', array_filter(explode(',', $searchQuery), 'is_numeric'));
                    });
                }
            }
        });

        return $query;
    }

    public function scopeCalendar(Builder $query, string $field, string $mode = 'month', CarbonImmutable $date = null): Builder
    {
        $date = $date ?: CarbonImmutable::now();

        return match ($mode) {
            'month' => $query
                ->whereDate($field, '>=', $date->startOfMonth())
                ->whereDate($field, '<=', $date->endOfMonth()),
            'week' => $query
                ->whereDate($field, '>=', $date->startOfWeek(CarbonInterface::SUNDAY))
                ->whereDate($field, '<=', $date->endOfWeek(CarbonInterface::SATURDAY)),
            'day' => $query
                ->whereDate($field, '>=', $date->subDay())
                ->whereDate($field, '<=', $date->addDay()),
            'all' => $query->whereDate($field, '>=', $date)
        };
    }

    abstract public function scopeSort(Builder $query, string $field, string $order);
}
