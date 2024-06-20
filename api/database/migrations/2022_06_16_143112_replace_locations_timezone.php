<?php

use App\Models\Company;
use App\Models\Location;
use Carbon\CarbonTimeZone;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration {

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Location::withTrashed()->each(function (Location $location) {
            $location->update(['time_zone' => timezone_name_from_abbr($location->time_zone)]);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Location::withTrashed()->each(function (Location $location) {
            $location->update(['time_zone' => Str::upper(CarbonTimeZone::create($location->time_zone)->getAbbreviatedName())]);
        });
    }
};
