@component('mail::message', ['logo' => $logo, 'logoAlt' => $logoAlt])

Hi there,

Please review the following appointments for the previous day, closing them out or canceling them.

Here’s the list of uncompleted appointments:

@foreach($appointments as $appointment)
* Appointment with {{ $appointment->employee->user->firstname }} {{ $appointment->employee->user->lastname }} - [Link to Appointment]({{ $appointment->backofficeUrl }})
@endforeach

@endcomponent
