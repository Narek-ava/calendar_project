<?php

namespace App\Services;

use App\Models\Appointment;
use Arr;
use Glorand\Model\Settings\Exceptions\ModelSettingsException;
use Illuminate\Support\Facades\Http;

final class ReputationManagementService
{
    // -------------------------------------------------------------------
    // Integrations
    public const GRADEUS_INTEGRATION = 'gradeus';
    public const REVIEWSHAKE_INTEGRATION = 'reviewshake';

    public static array $integrations = [
        self::GRADEUS_INTEGRATION,
        self::REVIEWSHAKE_INTEGRATION,
    ];

    private readonly Appointment $appointment;

    /**
     * @param Appointment $appointment
     * @return void
     * @throws ModelSettingsException
     */
    public function notify(Appointment $appointment): void
    {
        $this->appointment = $appointment;

        match ($appointment->company->settings()->get('integrations.reputation_management')) {
            self::GRADEUS_INTEGRATION     => $this->isGradeusConfigured() && $this->notifyGradeus(),
            self::REVIEWSHAKE_INTEGRATION => $this->isReviewshakeConfigured() && $this->notifyReviewshake(),
        };
    }

    /**
     * @return bool
     * @throws ModelSettingsException
     */
    private function isGradeusConfigured(): bool
    {
        if (
            !$this->appointment->company->settings()->get('integrations.gradeus.api_key') ||
            !$this->appointment->company->settings()->get('integrations.gradeus.profile_id') ||
            !$this->appointment->customer->email) {
            return false;
        }

        return true;
    }

    /**
     * @return bool
     * @throws ModelSettingsException
     */
    private function isReviewshakeConfigured(): bool
    {
        if (
            !$this->appointment->company->settings()->get('integrations.reviewshake.api_key') || (
                !$this->appointment->company->settings()->get('integrations.reviewshake.subdomain') &&
                !$this->appointment->company->settings()->get('integrations.reviewshake.custom_domain')) ||
            !$this->appointment->company->settings()->get('integrations.reviewshake.campaign') ||
            !$this->appointment->customer->email
        ) {
            return false;
        }

        return true;
    }

    /**
     * @return void
     * @throws ModelSettingsException
     */
    private function notifyGradeus(): void
    {
        // Configure
        $httpClient = Http::async()->baseUrl('https://grade.us/api/v4')
            ->withHeaders([
                'Content-Type'  => 'application/json',
                'Authorization' => $this->appointment->company->settings()->get('integrations.gradeus.api_key')
            ]);

        $profileId = $this->appointment->company->settings()->get('integrations.gradeus.profile_id');

        $response = $httpClient->post("/profiles/$profileId/recipients", [
            'recipients' => [[
                'email_address' => $this->appointment->customer->email,
                'first_name'    => $this->appointment->customer->firstname,
                'last_name'     => $this->appointment->customer->lastname
            ]]
        ])->wait();
    }

    /**
     * @return void
     * @throws ModelSettingsException
     */
    private function notifyReviewshake(): void
    {
        $subdomain = $this->appointment->company->settings()->get('integrations.reviewshake.subdomain');
        $parsedUrl = parse_url($this->appointment->company->settings()->get('integrations.reviewshake.custom_domain'));

        // Configure
        $scheme = Arr::get($parsedUrl, 'scheme', 'https');
        $host = Arr::get($parsedUrl, 'host', "$subdomain.reviewshake.com");

        $httpClient = Http::async()->baseUrl("$scheme://$host/api/v1")
            ->withHeaders([
                'Content-Type'  => 'application/json',
                'X-Spree-Token' => $this->appointment->company->settings()->get('integrations.reviewshake.api_key')
            ]);

        $customerData = [
            'first_name' => $this->appointment->customer->firstname,
            'last_name'  => $this->appointment->customer->lastname,
            'email'      => $this->appointment->customer->email,
//            'phone'      => $this->appointment->customer->phone,
        ];

        // Add some not required fields
        if ($reviewshakeClient = $this->appointment->company->settings()->get('integrations.reviewshake.client')) {
            Arr::set($customerData, 'client', $reviewshakeClient);
        }
        if ($reviewshakeLocationSlug = $this->appointment->company->settings()->get('integrations.reviewshake.location_slug')) {
            Arr::set($customerData, 'location_slug', $reviewshakeLocationSlug);
        }

        $response = $httpClient->post('/customer/subscribe', [
            'campaign_name' => $this->appointment->company->settings()->get('integrations.reviewshake.campaign'),
            'customer'      => $customerData,
        ])->wait();
    }
}
