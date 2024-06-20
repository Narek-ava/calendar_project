<?php

namespace App\Casts;

use App\Models\Location;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;

final class AppointmentDate implements CastsAttributes
{
    /**
     * Cast the given value.
     *
     * @param  Model  $model
     * @param  string  $key
     * @param  mixed  $value
     * @param  array  $attributes
     * @return CarbonImmutable
     */
    public function get($model, $key, $value, $attributes): CarbonImmutable
    {
        return CarbonImmutable::parse($value)->utc();
    }

    /**
     * Prepare the given value for storage.
     *
     * @param  Model  $model
     * @param  string  $key
     * @param  array  $value
     * @param  array  $attributes
     * @return string
     */
    public function set($model, $key, $value, $attributes)
    {
        // Do not convert from location timezone to utc
        $date = CarbonImmutable::parse($value);
        if ($date->isUtc()) return $date->toDateTimeString();

        // Parse date and convert from location timezone to utc
        return $date
            ->shiftTimezone(Location::withTrashed()->find($attributes['location_id'])->time_zone)
            ->utc()
            ->toDateTimeString();
    }
}
