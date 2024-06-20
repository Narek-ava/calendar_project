@extends('kiosk.layout')

@section('content')
    <form method="POST" action="{{ URL::signedRoute('kiosk.appointments', $location) }}" name="search-form">
        @csrf
        <div class="form-container">
            <h1 class="h3 mb-0 font-weight-normal" style="color:{{ $location->company->settings()->get('widget.textColor') }}">Welcome to {{ $location->name }}</h1>

            <input type="text" name="name" class="form-control @error('name') is-invalid @else is-valid @enderror"
                   placeholder="Your Name"
                   value="{{ old('name') }}"
                   autofocus>

            <input type="text" name="q"
                   class="form-control @error('q') is-invalid @else is-valid @enderror"
                   placeholder="Phone Number or Email"
                   value="{{ old('q') }}"
            >

            @if(session('customerNotFound'))
                <div class="alert alert-danger mb-0" role="alert">
                    Customer not found
                </div>
            @endif

            @if(session('checkedIn'))
                <div class="alert alert-success mb-0" role="alert">
                    You've checked in
                </div>
            @endif

            <button class="btn btn-search btn-lg btn-success btn-block" style="background:{{ $location->company->settings()->get('widget.buttonColor') }};color: {{ $location->company->settings()->get('widget.textColor') }}" type="submit">Search for Appointments</button>
        </div>
    </form>
@endsection

@section('javascripts')
    <script type="text/javascript">
        {{--
        $(document).ready(function () {
            $('input[name="q"]').mask('(000) 000-0000', options)
        })
        --}}
    </script>
@endsection


