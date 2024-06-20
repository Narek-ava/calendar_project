<?php

namespace App\Exports\Appointments;

use App\Http\Requests\Exports\AppointmentsReportRequest;
use App\Models\Appointment;
use App\Models\Company;
use Arr;
use Carbon\Carbon;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class AppointmentsDetailedTransactionsReport extends AppointmentsReport
{
    /**
     * @param AppointmentsReportRequest $request
     * @param Company $company
     */
    public function __construct(AppointmentsReportRequest $request, Company $company)
    {
        parent::__construct($request, $company);

        $this->headers['filename'] = $this->fileName = 'appointments-detailed-transactions-report-' . time() . '.csv';
    }

    /**
     * @return string[]
     */
    public function headings(): array
    {
        return [
            'ID', // A
            'Customer Name', // B
            'Date of an Appointment', // C
            'Type of Appointment', // D
            'Staff Name', // E
            'Service Name', // F
            'Total Amount', // G
            'Payment Date', // H
            'Paid', // I
            'Payment Method',  // J
            'Payment Reason', // K
            'Balance',  // L
        ];
    }

    /**
     * @param Appointment $appointment
     * @return array
     */
    public function map($appointment): array
    {
        $commonFields = [
            'id'               => $appointment->id,
            'customer_name'    => implode(' ', [
                $appointment->customerTrashed->firstname,
                $appointment->customerTrashed->lastname,
            ]),
            'appointment_date' => $appointment->start_at_local->toDateString(),
            'appointment_type' => $appointment->payment_type,
            'employee_name'    => implode(' ', [
                $appointment->employeeTrashed->user->firstname,
                $appointment->employeeTrashed->user->lastname,
            ]),
            'service_name'     => $appointment->serviceTrashed->name,
            'total_amount'     => $appointment->price ?? 0,

            // fields will be filled later if payments added
            'payment_date'     => '',
            'paid'             => 0,
            'payment_method'   => '',
            'payment_reason'   => '',
            'balance'          => $appointment->price ?? 0,
        ];

        if (!$appointment->payments) return $commonFields;

        $balance = Arr::get($commonFields, 'balance');

        return $appointment->payments->sortBy('datetime')->map(function ($payment) use ($appointment, $commonFields, &$balance) {

            $paid = Arr::get($payment, 'amount', 0);

            // calc balance w/0 gratuity
            if (Arr::get($payment, 'reason') !== Appointment::GRATUITY_PAYMENT_REASON) $balance -= $paid;

            $paymentFields = [
                'payment_date'   => Carbon::parse(Arr::get($payment, 'datetime'))->setTimezone($appointment->location->time_zone)->toDateString(),
                'paid'           => $paid,
                'payment_method' => Arr::get($payment, 'method'),
                'payment_reason' => Arr::get($payment, 'reason'),
                'balance'        => max($balance, 0),
            ];

            return array_merge($commonFields, $paymentFields);
        })->toArray();
    }

    /**
     * @return array
     */
    public function columnFormats(): array
    {
        return [
            'G' => NumberFormat::FORMAT_NUMBER_00,
            'I' => NumberFormat::FORMAT_NUMBER_00,
            'L' => NumberFormat::FORMAT_NUMBER_00,
        ];
    }
}
