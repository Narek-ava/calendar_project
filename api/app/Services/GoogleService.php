<?php

namespace App\Services;

use App\Models\Google\GoogleAccount;
use App\Models\Google\GoogleCalendar;
use Exception;
use Google\Client as GoogleClient;
use Google_Service_Calendar;
use Google_Service_Oauth2;
use Throwable;

class GoogleService
{
    /**
     * @param GoogleClient $client
     */
    function __construct(public GoogleClient $client)
    {
        $client->setClientId(config('services.google.client_id'));
        $client->setClientSecret(config('services.google.client_secret'));
        $client->setRedirectUri(config('services.google.redirect_uri'));
        $client->setScopes([
            Google_Service_Oauth2::USERINFO_EMAIL,
            Google_Service_Calendar::CALENDAR_READONLY,
            Google_Service_Calendar::CALENDAR_EVENTS,
        ]);
        $client->setPrompt('consent');
        $client->setAccessType('offline');
        $client->setIncludeGrantedScopes(true);
    }

    /**
     * @param $token
     * @return $this
     */
    public function connectUsing($token): static
    {
        $this->client->setAccessToken($token);

        return $this;
    }

    /**
     * @param $synchronizable
     * @return $this
     * @throws Throwable
     */
    public function connectWithSynchronizable($synchronizable): static
    {
        $token = $this->getTokenFromSynchronizable($synchronizable);

        return $this->connectUsing($token);
    }

    /**
     * @param GoogleAccount|GoogleCalendar $synchronizable
     * @return array
     * @throws Exception
     */
    protected function getTokenFromSynchronizable(GoogleAccount|GoogleCalendar $synchronizable): array
    {
        return match (true) {
            $synchronizable instanceof GoogleAccount  => $synchronizable->token,
            $synchronizable instanceof GoogleCalendar => $synchronizable->googleAccount->token,
            default                                   => throw new Exception('Invalid Synchronizable'),
        };
    }

    /**
     * @param $token
     * @return bool
     */
    public function revokeToken($token = null): bool
    {
        $token = $token ?? $this->client->getAccessToken();

        return $this->client->revokeToken($token);
    }

    public function service(string $service)
    {
        $classname = "Google_Service_$service";

        return new $classname($this->client);
    }

    /**
     * @param $method
     * @param $args
     * @return mixed
     * @throws Throwable
     */
    public function __call($method, $args)
    {
        if (!method_exists($this->client, $method)) {
            throw new Exception("Call to undefined method '$method'");
        }

        return call_user_func_array([$this->client, $method], $args);
    }
}
