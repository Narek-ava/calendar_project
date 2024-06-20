@component('mail::message', ['logo' => $logo, 'logoAlt' => $logoAlt])

{{ $employee->user->firstname }},

A new appointment was scheduled for you!

To view the appointment details, please click the button below.

@include('emails.appointment.employee.partials.more-details', [
    'location' => $location,
    'service' => $service,
    'appointment' => $appointment,
    'customer' => $customer,
    ])

@component('mail::button', ['url' => $appointment->backofficeUrl])
    View Appointment
@endcomponent

@endcomponent


