@component('mail::message')
# Welcome

Thank you for subscribing to Chilled Butter! We genuinely appreciate your business.

Remember, we’re here to ensure that you have a pleasant experience with our platform. As a first step, we’d recommend setting up an onboarding appointment. This will be a one-on-one appointment where one of our staff walk you through setting up your business, services and staff, as well as answer any questions.

@component('mail::button', ['url' => 'https://app.chilledbutter.com/cal/chilled-butter-1/service-virtual-appointment/employee-chilled-butter'])
    Schedule Onboarding
@endcomponent

Feel free to contact Chilled Butter Support at <a href="mailto:support@chilledbutter.com">support@chilledbutter.com</a> at any time.

Thanks,<br>
{{ config('app.name') }}
@endcomponent
