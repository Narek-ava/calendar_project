<?php

namespace App\Listeners;

use App\Services\SubscriptionLimitsService;
use Exception;
use Illuminate\Http\Response;
use Illuminate\Support\Arr;
use Laravel\Cashier\Cashier;
use Laravel\Cashier\Events\WebhookHandled;
use Stripe\Exception\ApiErrorException;
use Throwable;
use function Sentry\captureException;

class StripeEventListener
{
    public const CUSTOMER_SUBSCRIPTION_UPDATED = 'customer.subscription.created';
    public const CUSTOMER_SUBSCRIPTION_CREATED = 'customer.subscription.updated';
    public const CUSTOMER_SUBSCRIPTION_DELETED = 'customer.subscription.deleted';

    public static array $eventTypes = [
        self::CUSTOMER_SUBSCRIPTION_CREATED,
        self::CUSTOMER_SUBSCRIPTION_UPDATED,
        self::CUSTOMER_SUBSCRIPTION_DELETED,
    ];

    /**
     * Handle received Stripe webhooks.
     *
     * @param WebhookHandled $event
     * @return Response
     */
    public function handle(WebhookHandled $event): Response
    {
        try {
            return match (Arr::get($event->payload, 'type')) {
                self::CUSTOMER_SUBSCRIPTION_CREATED,
                self::CUSTOMER_SUBSCRIPTION_UPDATED => self::customerSubscriptionUpdated($event),
                self::CUSTOMER_SUBSCRIPTION_DELETED => self::customerSubscriptionDeleted($event),
            };
        } catch (Throwable $e) {
            captureException($e);
            return response(['message' => $e->getMessage()], 400);
        }
    }

    /**
     * @param WebhookHandled $event
     * @return Response
     * @throws ApiErrorException|Exception
     */
    private static function customerSubscriptionUpdated(WebhookHandled $event): Response
    {
        // Search company owner in CB by customer email from stripe
        $cbUser = Cashier::findBillable(Arr::get($event->payload, 'data.object.customer'));
        if (!$cbUser) return response(['result' => false], 400);

        // Get product from event and product's limit name
        $stripeProduct = Cashier::stripe()->products->retrieve(Arr::get($event->payload, 'data.object.plan.product'));
        $newLimitName = $stripeProduct->metadata->limitName;

        if (!in_array($newLimitName, SubscriptionLimitsService::$types)) throw new Exception("Given Unknown Limit Name: $newLimitName");

        $cbUser->companyOwner->update(['subscription_type' => $newLimitName]);

        return response(['result' => true]);
    }

    /**
     * @param WebhookHandled $event
     * @return Response
     * @throws ApiErrorException|Exception
     */
    private static function customerSubscriptionDeleted(WebhookHandled $event): Response
    {
        // Search company owner in CB by customer email from stripe
        $cbUser = Cashier::findBillable(Arr::get($event->payload, 'data.object.customer'));
        if (!$cbUser) return response(['result' => false], 400);

        $cbUser->companyOwner->update(['subscription_type' => SubscriptionLimitsService::DEACTIVATED_TYPE]);

        return response(['result' => true]);
    }
}
