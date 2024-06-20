<?php

use App\Models\Employee;
use App\Models\Location;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Artisan::call('cache:clear');

        // Other settings
        Employee::with(['company' => fn($q) => $q->withTrashed()])->withTrashed()->each(function (Employee $employee) {
            $locations = [];
            $employee->company->locations()->withTrashed()->each(function (Location $location) use (&$locations) {
                $locations[] = [
                    'id'        => $location->id,
                    'services'  => $location->services->pluck('id'),
                    'employees' => $location->employees->pluck('id'),
                ];
            });

            $employee->settings()->setMultiple([
                'calendar.cell_duration'              => 60,
                'calendar.show_scheduled_staff'       => false,
                'calendar.show_canceled_appointments' => true,
                'calendar.selected_location_id'       => $employee->company->locations()->withTrashed()->first()->id ?? null,
                'calendar.locations'                  => $locations,
            ]);
        });

        // Calendar cell duration based on location setting
        Location::with(['employees' => fn($q) => $q->withTrashed()])->withTrashed()->each(function (Location $location) {
            $location->employees->each(function (Employee $employee) use ($location) {
                $employee->settings()->set('calendar.cell_duration', $location->calendar_cell_duration);
            });
        });

        Schema::table('locations', function (Blueprint $table) {
            $table->dropColumn('calendar_cell_duration');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            $table->integer('calendar_cell_duration')->default(60);
        });
    }
};
