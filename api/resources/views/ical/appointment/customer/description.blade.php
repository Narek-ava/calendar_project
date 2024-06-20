Service: {{ $appointment->serviceTrashed->name }} with {{ $appointment->employeeTrashed->user->full_name }}

@if($appointment->serviceTrashed->is_virtual && $appointment->status === \App\Models\Appointment::ACTIVE_STATUS)
Link to virtual meeting: <a href="{{ $appointment->getShortUrl('tvaUrl') }}?name={{ $appointment->customer->full_name }}">{{ $appointment->getShortUrl('tvaUrl') }}</a><br/>
@endif
View Appointment: <a href="{{ $appointment->getShortUrl('widgetUrl') }}">{{ $appointment->getShortUrl('widgetUrl') }}</a>
