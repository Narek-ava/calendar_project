@component('mail::message', ['logo' => $logo, 'logoAlt' => $logoAlt])

{{ $customer->firstname }},

Thanks for booking with {{ $company->name }}, we look forward to serving you.

@include('emails.appointment.customer.partials.more-details', [
    'location' => $location,
    'service' => $service,
    'appointment' => $appointment,
    'employee' => $employee,
    ])

@if($company->settings()->get('widget.confirmation_note') || $service->confirmation_note)
## Instructions:
{{ $service->confirmation_note ?? $company->settings()->get('widget.confirmation_note') }}
@endif

@component('mail::button', ['url' => $appointment->widgetUrl])
   View Appointment
@endcomponent

@endcomponent


