<?php

namespace App\Exports;

use App\Http\Requests\Exports\CustomersExportRequest;
use App\Models\Appointment;
use App\Models\Company;
use App\Models\Customer;
use Carbon\Carbon;
use Illuminate\Contracts\Support\Responsable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Illuminate\Database\Eloquent\Builder;

class CustomersExport implements FromQuery, Responsable, WithColumnFormatting, WithMapping, WithHeadings
{
    use Exportable;

    /**
     * It's required to define the fileName within
     * the export class when making use of Responsable.
     */
    private string $fileName = 'customers.csv';

    /**
     * @var CustomersExportRequest
     */
    private CustomersExportRequest $request;
    /**
     * @var Company
     */
    private Company $company;

    /**
     * @param CustomersExportRequest $request
     */
    public function __construct(CustomersExportRequest $request)
    {
        $this->request = $request;
    }

    /**
     * @return string[]
     */
    public function headings(): array
    {
        return [
            'First Name',
            'Last Name',
            'Phone Number',
            'Email',
            'Last Service Date',
            'Last Service Type/Name',
        ];
    }

    /**
     * @param Customer $customer
     * @return array
     */
    public function map($customer): array
    {
        return [
            $customer->firstname,
            $customer->lastname,
            $customer->phone,
            $customer->email,
            $customer->appointments->first()?->start_at_local->toDateString(),
            $customer->appointments->first()?->service->name,
        ];
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

        return auth()->user()->contextCompany->customers()
            ->when($filters->has('date_from'), function (Builder $query) use ($filters) {
                $query->where('created_at', '>=', Carbon::parse($filters->get('date_from'))->startOfDay());
            })
            ->when($filters->has('date_to'), function (Builder $query) use ($filters) {
                $query->where('created_at', '<=', Carbon::parse($filters->get('date_to'))->endOfDay());
            })
            ->with(['appointments' => function (Builder|HasMany $query) use ($filters) {
                $query
                    ->where('type', Appointment::APPOINTMENT_TYPE)
                    ->whereIn('status', [
//                    Appointment::ACTIVE_STATUS,
                        Appointment::COMPLETED_STATUS
                    ])
                    ->orderByDesc('end_at');
            }]);
    }
}
