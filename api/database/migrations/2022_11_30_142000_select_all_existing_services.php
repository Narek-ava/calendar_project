<?php

use App\Models\Employee;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration {

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Employee::all()->each(function (Employee $employee) {
            if ($settings = $employee->settings()->get('calendar.locations')) {
                array_walk($settings, fn(&$location) => $location['services'] = $employee->company?->services->pluck('id') ?? []);
                $employee->settings()->update('calendar.locations', $settings);
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {

    }
};
