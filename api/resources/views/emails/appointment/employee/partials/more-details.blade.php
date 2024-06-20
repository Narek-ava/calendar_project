## More details:

Customer: {{ $customer->firstname }} {{ $customer->lastname }}

Service: {{ $service->name }}

Date & Time: {{ $appointment->start_at_local->isoFormat('MM/DD/YY h:mm A') }}

@if($service->is_virtual && $appointment->status === \App\Models\Appointment::ACTIVE_STATUS)
Link to virtual meeting: <a href="{{ $appointment->getShortUrl('tvaUrl') }}?name={{ $employee->user->fullname }}">{{ $appointment->getShortUrl('tvaUrl') }}</a>

@if($appointment->start_at_local->isUtc())
Time Zone: UTC
@else
{{--
    (+06 / UTC+06:00) Asia/Omsk
    (-05 / UTC-05:00) Etc/GMT+5
    (CST / UTC-06:00) America/Chicago
--}}
Time Zone: {{$appointment->start_at_local->format('(T / \U\T\CP) e')}}@endif
@endif

@if(!$service->is_virtual)
Location: {{ $location->name }}
@endif
