@component('mail::message', ['logo' => $logo, 'logoAlt' => $logoAlt])

{{ $customer->firstname }},

Just a friendly reminder of your appointment tomorrow at {{ $appointment->start_at_customer->isoFormat('MM/DD/YY h:mm A') }} with {{ $employee->user->firstname }}, at {{ $location->name }}.

@include('emails.appointment.customer.partials.more-details', [
    'location' => $location,
    'service' => $service,
    'appointment' => $appointment,
    'employee' => $employee,
    ])

@component('mail::button', ['url' => $appointment->widgetUrl])
    View Appointment
@endcomponent

Got questions?  Feel free to call us directly: {{ $company->phone }}

@endcomponent


