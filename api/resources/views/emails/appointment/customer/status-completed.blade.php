@component('mail::message', ['logo' => $logo, 'logoAlt' => $logoAlt])

Hello there!

Thank you so much for your appointment today, we hope everything went well, and we are looking forward to seeing you again!

Please use the link to book your next appointment with us - <a href="{{ $company->getShortURL() }}">{{ $company->getShortURL() }}</a>

@endcomponent


