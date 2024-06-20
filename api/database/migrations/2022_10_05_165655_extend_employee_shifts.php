<?php

use App\Models\Employee;
use Carbon\CarbonImmutable;
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
        Employee::all()->each(function (Employee $employee) {
            $newShifts = collect($employee->shifts)->map(function ($shiftedDate) use ($employee) {

                $date = CarbonImmutable::parse($shiftedDate);
                $startTime = collect($employee->schedule)->firstWhere('id', $date->dayOfWeek)['start'];
                $endTime = collect($employee->schedule)->firstWhere('id', $date->dayOfWeek)['end'];

                return [
                    'date'   => $date,
                    'start'  => $date->setTimeFrom($startTime),
                    'end'    => $date->setTimeFrom($endTime),
                    'opened' => true,
                ];
            });
            $employee->update(['shifts' => $newShifts]);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Employee::all()->each(function (Employee $employee) {
            $newShifts = collect($employee->shifts)->map(function ($shiftedDate) use ($employee) {
                return CarbonImmutable::parse($shiftedDate['date'])->format('m/d/Y');
            });

            $employee->update(['shifts' => $newShifts]);
        });
    }
};
