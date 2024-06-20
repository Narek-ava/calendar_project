@component('mail::message', ['logo' => $logo, 'logoAlt' => $logoAlt])
# Welcome

Hi {{ $user->fullname }}, you have been invited to {{ $company->name }}

@component('mail::button', ['url' => config('app.frontend_url') . "/invite/$company->id/$user->email/$verifyToken"])
Accept the Invitation
@endcomponent

Thanks,<br>
{{ config('app.name') }}
@endcomponent
