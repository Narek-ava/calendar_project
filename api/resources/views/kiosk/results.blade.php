@extends('kiosk.layout')

@section('content')
    <div class="form-container">
        <h1 class="h3 font-weight-normal mb-0" style="color:{{$location->company->settings()->get('widget.textColor')}}">Hello, {{ $customer->fullname }}</h1>

        @if(count($appointments))
            <h1 class="h5 font-weight-normal mb-0" style="color:{{$location->company->settings()->get('widget.textColor')}}">Click on appointment to check-in:</h1>

            <div class="list-group">
                @foreach($appointments as $appointment)
                    <a
                        @if(!$appointment->is_checked_in)
                            href="{{ URL::signedRoute('kiosk.check-in', [$location, $appointment]) }}"
                        @endif
                        @class([
                            'list-group-item list-group-item-action',
                            'disabled list-group-item-success' => $appointment->is_checked_in,
                        ]) style="background:{{ $location->company->settings()->get('widget.primaryColor') }};color: {{ $location->company->settings()->get('widget.textColor')}}">

                        {{ $appointment->service->name }} with {{ $appointment->employee->user->fullname }},
                        {{ $appointment->start_at_local->isoFormat('MM/DD/YY \a\t h:mma') }}

                        @if($appointment->is_checked_in)
                            <span class="badge badge-success badge-pill">✓ checked-in</span>
                        @endif
                    </a>
                @endforeach
            </div>
        @else
            <div class="alert alert-warning mb-0" role="alert">
                Sorry, there are no appointments scheduled for you for today
            </div>
        @endif

        <a href="{{ URL::signedRoute('kiosk.search', [$location]) }}" class="btn btn-grey btn-block" type="submit" style="color:{{$location->company->settings()->get('widget.primaryColor')}}">Return
            Back</a>
    </div>


@endsection


