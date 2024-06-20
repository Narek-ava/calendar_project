<?php

namespace App\Exports\Appointments;

use App\Http\Requests\Exports\AppointmentsReportRequest;
use App\Models\Appointment;
use App\Models\Company;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class AppointmentsServiceBalanceReport extends AppointmentsReport
{
    /**
     * @param AppointmentsReportRequest $request
     * @param Company $company
     */
    public function __construct(AppointmentsReportRequest $request, Company $company)
    {
        parent::__construct($request, $company);

        $this->headers['filename'] = $this->fileName = 'appointments-service-balance-report-' . time() . '.csv';
    }

    /**
     * @return string[]
     */
    public function headings(): array
    {
        return [
            'ID',
            'Customer Name',
            'Date of an Appointment',
            'Type of Appointment',
            'Staff Name',
            'Service Name',
            'Total Amount',
            'Paid',
            'Balance',
            'Gratuity',
        ];
    }

    /**
     * @param Appointment $appointment
     * @return array
     */
    public function map($appointment): array
    {
        // Some calculations
        $total = $appointment->price;
        $paid = $appointment->payments?->sum('amount') ?? 0;
        $balance = $total - $paid > 0 ? $total - $paid : 0;
        $gratuity = $appointment->payments?->where('reason', Appointment::GRATUITY_PAYMENT_REASON)->sum('amount') ?? 0;

        return [
            $appointment->id,
            implode(' ', [
                $appointment->customerTrashed->firstname,
                $appointment->customerTrashed->lastname,
            ]),
            $appointment->start_at_local->toDateString(),
            $appointment->payment_type,
            implode(' ', [
                $appointment->employeeTrashed->user->firstname,
                $appointment->employeeTrashed->user->lastname,
            ]),
            $appointment->serviceTrashed->name,
            $total, // G
            $paid, // H
            $balance, // I
            $gratuity, // J
        ];
    }

    /**
     * @return array
     */
    public function columnFormats(): array
    {
        return [
            'G' => NumberFormat::FORMAT_NUMBER_00,
            'H' => NumberFormat::FORMAT_NUMBER_00,
            'I' => NumberFormat::FORMAT_NUMBER_00,
            'J' => NumberFormat::FORMAT_NUMBER_00,
        ];
    }
}
