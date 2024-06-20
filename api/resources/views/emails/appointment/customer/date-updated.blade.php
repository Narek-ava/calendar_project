@component('mail::message', ['logo' => $logo, 'logoAlt' => $logoAlt])

{{ $customer->firstname }},

We wanted to inform you that the appointment has been updated.  Please see the updated appointment details below:

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


