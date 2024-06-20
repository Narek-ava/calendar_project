<?php

use App\Models\Employee;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Carbon;

return new class extends Migration {

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Employee::withTrashed()->where('is_shifts_enabled', true)->each(function (Employee $employee) {
            // Skip empty shifts
            if (!count($employee->shifts)) return;

            $oldShifts = collect($employee->shifts);

            $newShifts = $oldShifts
                ->filter(fn($shift) => Arr::has($shift, 'date'))
                ->map(function ($shift) {
                    $start = Carbon::parse(Arr::get($shift, 'start'));
                    $end = Carbon::parse(Arr::get($shift, 'end'));
                    $date = Carbon::parse(Arr::get($shift, 'date'));

                    return [
                        'start'  => $start->setDateFrom($date)->toDateTimeString(),
                        'end'    => $end->setDateFrom($date)->toDateTimeString(),
                        'opened' => Arr::get($shift, 'opened'),
                    ];
                });

            // Skip not converted since it's already period
            if (count($newShifts) === 0) return;

            $employee->shifts = $newShifts;
            $employee->save();
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
