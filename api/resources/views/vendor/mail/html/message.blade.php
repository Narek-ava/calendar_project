@component('mail::layout')
    {{-- Header --}}
    @slot('header')
        @component('mail::header', ['url' => config('app.frontend_url'), 'logo' => $logo ?? null, 'logoAlt' => $logoAlt ?? null])
            {{ config('app.name') }}
        @endcomponent
    @endslot

    {{-- Body --}}
    {{ $slot }}

    {{-- Subcopy --}}
    @isset($subcopy)
        @slot('subcopy')
            @component('mail::subcopy')
                {{ $subcopy }}
            @endcomponent
        @endslot
    @endisset

    {{-- Footer --}}
    @slot('footer')
        @component('mail::footer')
{{--            © {{ date('Y') }} {{ $logoAlt ?? config('app.name') }}. @lang('All rights reserved.')--}}
        @endcomponent
    @endslot
@endcomponent
