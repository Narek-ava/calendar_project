@extends('layouts.app')

@section('title_full', __(TwilioSmsIntegration::CHANNEL_NAME).' - '.$mailbox->name)

@section('sidebar')
    @include('partials/sidebar_menu_toggle')
    @include('mailboxes/sidebar_menu')
@endsection

@section('content')

    <div class="section-heading margin-bottom">
        {{ __(TwilioSmsIntegration::CHANNEL_NAME) }}
    </div>

    <div class="col-xs-12">

        @include('partials/flash_messages')

        {{--        @if ($errors->any())--}}
        {{--            <div class="alert alert-danger">--}}
        {{--                <ul>--}}
        {{--                    @foreach ($errors->all() as $error)--}}
        {{--                        <li>{{ $error }}</li>--}}
        {{--                    @endforeach--}}
        {{--                </ul>--}}
        {{--            </div>--}}
        {{--        @endif--}}

        <pre>
Log into Twilio.com and go to the <a href="https://www.twilio.com/console/phone-numbers/incoming"
                                     target="_blank">Console's Numbers page</a>
Click on the phone number we want to use for this project
Find the Messaging section and the "A MESSAGE COMES IN" option
Select "Webhook" and paste in the URL below with type <b>HTTP POST</b>:

<b>{{ route(TwilioSmsIntegration::MODULE_NAME . '.webhook', ['mailbox' => $mailbox, 'mailbox_secret' => TwilioSmsIntegration::getMailboxSecret($mailbox)]) }}</b></pre>
        <hr/>

        <form class="form-horizontal margin-bottom" method="POST" action="" autocomplete="off">
            {{ csrf_field() }}

            {{--            <div class="form-group{{ $errors->has('enabled') ? ' has-error' : '' }}">--}}
            {{--                <label for="settings_enabled" class="col-sm-2 control-label">{{ __('Enabled') }}</label>--}}

            {{--                <div class="col-sm-6">--}}
            {{--                    <div class="controls">--}}
            {{--                        <div class="onoffswitch-wrap">--}}
            {{--                            <div class="onoffswitch">--}}
            {{--                                <input type="hidden" name="enabled" value="0">--}}
            {{--                                <input type="checkbox" name="enabled" id="settings_enabled"--}}
            {{--                                       class="onoffswitch-checkbox"--}}
            {{--                                       value="1"--}}
            {{--                                       @if (old('enabled', $settings['enabled'] ?? false))checked="checked"@endif--}}
            {{--                                />--}}
            {{--                                <label class="onoffswitch-label" for="settings_enabled"></label>--}}
            {{--                            </div>--}}
            {{--                        </div>--}}
            {{--                    </div>--}}
            {{--                    @include('partials/field_error', ['field'=>'enabled'])--}}
            {{--                </div>--}}
            {{--            </div>--}}

            <div class="form-group{{ $errors->has('account_sid') ? ' has-error' : '' }}">
                <label class="col-sm-2 control-label">{{ __('Account SID') }}</label>

                <div class="col-sm-6">
                    <input type="text" class="form-control input-sized-lg" name="account_sid" required
                           value="{{ old('account_sid', $settings['account_sid'] ?? '') }}">
                    @include('partials/field_error', ['field'=>'account_sid'])
                </div>
            </div>

            <div class="form-group{{ $errors->has('auth_token') ? ' has-error' : '' }}">
                <label class="col-sm-2 control-label">{{ __('Auth Token') }}</label>

                <div class="col-sm-6">
                    <input type="text" class="form-control input-sized-lg" name="auth_token" required
                           value="{{ old('auth_token', $settings['auth_token'] ?? '') }}">
                    <div class="form-help">
                        <a href="https://console.twilio.com/develop/sms/try-it-out/get-set-up?frameUrl=%2Fconsole%2Fsms%2Fget-setup"
                           target="_blank">{{ __('Where to find') }} <small
                                class="glyphicon glyphicon-share"></small></a>
                    </div>

                    @include('partials/field_error', ['field'=>'auth_token'])
                </div>
            </div>

            <hr/>

            <div class="form-group{{ $errors->has('messaging_service_sid') ? ' has-error' : '' }}">
                <label class="col-sm-2 control-label">{{ __('Messaging Service SID') }}</label>

                <div class="col-sm-6">
                    <input type="text" class="form-control input-sized-lg" name="messaging_service_sid" required
                           value="{{ old('messaging_service_sid', $settings['messaging_service_sid'] ?? '') }}">
                    <div class="form-help">
                        <a href="https://console.twilio.com/develop/sms/services?frameUrl=%2Fconsole%2Fsms%2Fservices"
                           target="_blank">{{ __('Where to find') }} <small
                                class="glyphicon glyphicon-share"></small></a>
                    </div>

                    @include('partials/field_error', ['field'=>'messaging_service_sid'])
                </div>
            </div>

            <div class="form-group margin-top">
                <div class="col-sm-6 col-sm-offset-2">
                    <button type="submit" class="btn btn-primary">
                        {{ __('Save') }}
                    </button>
                </div>
            </div>
        </form>
    </div>
@endsection
