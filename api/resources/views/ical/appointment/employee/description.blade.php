Customer: {{ $appointment->customer->full_name }}
Service: {{ $appointment->serviceTrashed->name }}

@if($appointment->serviceTrashed->is_virtual && $appointment->status === \App\Models\Appointment::ACTIVE_STATUS)
Link to virtual meeting: <a href="{{ $appointment->getShortUrl('tvaUrl') }}?name={{ $appointment->employeeTrashed->user->full_name }}">{{ $appointment->getShortUrl('tvaUrl') }}</a>
@endif
View Appointment: <a href="{{ $appointment->getShortUrl('backofficeUrl') }}">{{ $appointment->getShortUrl('backofficeUrl') }}</a>
