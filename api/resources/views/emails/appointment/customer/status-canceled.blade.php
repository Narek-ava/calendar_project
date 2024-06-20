@component('mail::message', ['logo' => $logo, 'logoAlt' => $logoAlt])

{{ $customer->firstname }},

We wanted to inform you that the following appointment was cancelled.

@include('emails.appointment.customer.partials.more-details', [
    'location' => $location,
    'service' => $service,
    'appointment' => $appointment,
    'employee' => $employee,
    ])

Got questions?  Feel free to call us directly: {{ $company->phone }}

@endcomponent


