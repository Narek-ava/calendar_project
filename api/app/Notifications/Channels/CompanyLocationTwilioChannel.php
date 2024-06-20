<?php

namespace App\Notifications\Channels;

use Exception;
use Illuminate\Notifications\Notification;
use NotificationChannels\Twilio\TwilioChannel;
use NotificationChannels\Twilio\TwilioConfig;
use ReflectionException;
use ReflectionObject;
use Twilio\Exceptions\ConfigurationException;
use Twilio\Rest\Client as TwilioService;

class CompanyLocationTwilioChannel extends TwilioChannel
{
    /**
     * @param $notifiable
     * @param Notification $notification
     * @return mixed
     * @throws Exception
     */
    public function send($notifiable, Notification $notification): mixed
    {
        $this->applyCompanyLocationConfig($notification);
        return parent::send($notifiable, $notification);
    }

    /**
     * @throws ConfigurationException
     * @throws ReflectionException
     */
    private function applyCompanyLocationConfig(Notification $notification): void
    {
        // ATM only for appointments
        if (!property_exists($notification, 'appointment')) return;

        $appointment = $notification->appointment;
        $company = $appointment->company;
        if (!$company->is_twilio_enabled) return;

        $location = $appointment->location;

        if ($this->twilio->config->usingUsernamePasswordAuth()) {
            $config = new TwilioConfig([
                ...config('twilio-notification-channel'),
                ...[
                    'account_sid' => $company->settings()->get('integrations.twilio.account_sid'),
                    'username'    => $company->settings()->get('integrations.twilio.username'),
                    'password'    => $company->settings()->get('integrations.twilio.password'),
                    'from'        => $location->twilio_phone,
                ]
            ]);

            $twilioService = new TwilioService($config->getUsername(), $config->getPassword(), $config->getAccountSid());
        }

        if ($this->twilio->config->usingTokenAuth()) {
            $config = new TwilioConfig([
                ...config('twilio-notification-channel'),
                ...[
                    'auth_token'  => $company->settings()->get('integrations.twilio.auth_token'),
                    'account_sid' => $company->settings()->get('integrations.twilio.account_sid'),
                    'from'        => $location->twilio_phone,
                ]
            ]);

            $twilioService = new TwilioService($config->getAccountSid(), $config->getAuthToken());
        }

        // Let the magic begin
        $reflection = new ReflectionObject($this->twilio);

        // Just in case if the config property becomes private in the future updates
        $twilioConfigProperty = $reflection->getProperty('config');
        $twilioConfigProperty->setAccessible(true);
        $twilioConfigProperty->setValue($this->twilio, $config);

        $twilioServiceProperty = $reflection->getProperty('twilioService');
        $twilioServiceProperty->setAccessible(true);
        $twilioServiceProperty->setValue($this->twilio, $twilioService);
    }
}


