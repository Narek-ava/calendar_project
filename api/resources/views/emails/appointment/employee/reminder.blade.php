@component('mail::message', ['logo' => $logo, 'logoAlt' => $logoAlt])

{{ $employee->user->firstname }},

Just a friendly reminder of your appointment tomorrow at {{ $appointment->start_at_local->isoFormat('MM/DD/YY h:mm A') }} with {{ $customer->firstname }}, at {{ $location->name }}.

@include('emails.appointment.employee.partials.more-details', [
    'location' => $location,
    'service' => $service,
    'appointment' => $appointment,
    'employee' => $employee,
    ])

@component('mail::button', ['url' => $appointment->backofficeUrl])
    View Appointment
@endcomponent

Got questions?  Feel free to call us directly: {{ $company->phone }}

@endcomponent


