@component('mail::message', ['logo' => $logo, 'logoAlt' => $logoAlt])

{{ $employee->user->firstname }},

We wanted to inform you that the appointment time was updated, the detailed information is below:

@include('emails.appointment.employee.partials.more-details', [
    'location' => $location,
    'service' => $service,
    'appointment' => $appointment,
    'customer' => $customer,
    ])

To view the appointment, please click the button below, it will redirect you to the appointment.

@component('mail::button', ['url' => $appointment->backofficeUrl])
    View Appointment
@endcomponent

@endcomponent


