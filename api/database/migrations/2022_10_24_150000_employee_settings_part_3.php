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
        Employee::withTrashed()->each(function (Employee $employee) {
            $employee->settings()->set('widget.use_location_schedule', true);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Employee::withTrashed()->each(function (Employee $employee) {
            $employee->settings()->delete('widget.use_location_schedule');
        });
    }
};
