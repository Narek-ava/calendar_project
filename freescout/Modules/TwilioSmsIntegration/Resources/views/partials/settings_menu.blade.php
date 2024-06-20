<li @if (\Helper::isMenuSelected(TwilioSmsIntegration::MODULE_NAME))class="active"@endif>
    <a href="{{ route('mailboxes.' . TwilioSmsIntegration::MODULE_NAME . '.settings', ['mailbox' => $mailbox]) }}"><i
            class="glyphicon glyphicon-phone"></i> {{ __(TwilioSmsIntegration::CHANNEL_NAME) }}</a>
</li>
