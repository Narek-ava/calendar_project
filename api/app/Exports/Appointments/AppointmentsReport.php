<?php

namespace App\Exports\Appointments;

use App\Http\Requests\Exports\AppointmentsReportRequest;
use App\Models\Appointment;
use App\Models\Company;
use Carbon\Carbon;
use Illuminate\Contracts\Support\Responsable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStrictNullComparison;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class AppointmentsReport implements FromQuery, Responsable, WithColumnFormatting, WithMapping, WithHeadings, WithStrictNullComparison
{
    use Exportable;

    /**
     * It's required to define the fileName within
     * the export class when making use of Responsable.
     */
    public string $fileName;

    /**
     * @var AppointmentsReportRequest
     */
    private AppointmentsReportRequest $request;
    /**
     * @var Company
     */
    private Company $company;

    /**
     * @param AppointmentsReportRequest $request
     * @param Company $company
     */
    public function __construct(AppointmentsReportRequest $request, Company $company)
    {
        $this->request = $request;
        $this->company = $company;
    }

    /**
     * Optional headers
     */
    public array $headers = [
        'filename'
    ];

    /**
     * @return string[]
     */
    public function headings(): array
    {
        return [];
    }

    /**
     * @param Appointment $appointment
     * @return array
     */
    public function map($appointment): array
    {
        return [];
    }

    /**
     * @return array
     */
    public function columnFormats(): array
    {
        return [];
    }

    public function query()
    {
        $filters = collect($this->request->validated('filters'));

        return $this->company->appointments()
            ->select('appointments.*')
            ->when($filters->has('locations'), function (Builder $query) use ($filters) {
                $query
                    ->leftJoin('locations', 'appointments.location_id', 'locations.id')
                    ->where(function ($query) use ($filters) {
                        foreach (explode(',', $filters->get('locations')) as $locationId) {
                            $query->orWhere(function ($query) use ($filters, $locationId) {
                                $query
                                    ->where('appointments.location_id', $locationId)
                                    ->when($filters->has('date_from'), function (Builder $query) use ($filters) {
                                        $date = Carbon::parse($filters->get('date_from'))->startOfDay();
                                        // Assume the date given on location's timezone, so convert the date to UTC
                                        $query->where('appointments.start_at', '>=', DB::raw("'$date'::timestamp AT TIME ZONE locations.time_zone"));
                                    })
                                    ->when($filters->has('date_to'), function (Builder $query) use ($filters) {
                                        $date = Carbon::parse($filters->get('date_to'))->endOfDay();
                                        $query->where('appointments.start_at', '<=', DB::raw("'$date'::timestamp AT TIME ZONE locations.time_zone"));
                                    });
                            });
                        }
                    });
            })
            ->when($filters->has('employees'), function (Builder $query) use ($filters) {
                $query->whereHas('employee', function (Builder $query) use ($filters) {
                    $query->withTrashed()->whereIn('id', explode(',', $filters->get('employees')));
                });
            })
            ->where('appointments.type', Appointment::APPOINTMENT_TYPE)
            ->where('appointments.status', Appointment::COMPLETED_STATUS)
            ->orderBy('appointments.start_at')
            ->orderByDesc('appointments.id')
            ->with([
                'customerTrashed',
                'employeeTrashed.user',
                'serviceTrashed',
            ]);
    }
}
