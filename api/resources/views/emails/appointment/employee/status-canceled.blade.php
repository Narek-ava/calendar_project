@component('mail::message', ['logo' => $logo, 'logoAlt' => $logoAlt])

{{ $employee->user->firstname }},

We wanted to inform you that the appointment with the information below was cancelled.

@include('emails.appointment.employee.partials.more-details', [
    'location' => $location,
    'service' => $service,
    'appointment' => $appointment,
    'customer' => $customer,
    ])

No actions required from your side.

@endcomponent


