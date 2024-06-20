## More details:


@if($service->is_virtual && $appointment->status === \App\Models\Appointment::ACTIVE_STATUS)
Link to virtual meeting: <a href="{{ $appointment->getShortUrl('tvaUrl') }}?name={{ $customer->fullname }}">{{ $appointment->getShortUrl('tvaUrl') }}</a>

@if($appointment->start_at_customer->isUtc())
Time Zone: UTC
@else
{{--
    (+06 / UTC+06:00) Asia/Omsk
    (-05 / UTC-05:00) Etc/GMT+5
    (CST / UTC-06:00) America/Chicago
--}}
Time Zone: {{$appointment->start_at_customer->format('(T / \U\T\CP) e')}}
@endif
@endif

@if(!$service->is_virtual)
Location: <a href="https://maps.google.com/maps?q={{ $location->address->full }}">{{ $location->address->full }}</a>
@endif

Service: {{ $service->name }}

Date & Time: {{ $appointment->start_at_customer->isoFormat('MM/DD/YY h:mm A') }}

With: {{ $employee->user->fullname }}
