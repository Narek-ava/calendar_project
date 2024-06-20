@component('mail::message', ['logo' => $logo, 'logoAlt' => $logoAlt])

Hi there,

You have the following appointments scheduled for today:

@foreach($appointments as $appointment)
* Appointment with {{ $appointment->customer->firstname }} {{ $appointment->customer->lastname }} - [Link to Appointment]({{ $appointment->backofficeUrl }})
@endforeach

Thank you.
@endcomponent
