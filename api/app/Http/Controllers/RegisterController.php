<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegisterRequest;
use App\Models\User;
use App\Services\CompanyService;
use App\Services\Exceptions\UserException;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Laravel\Cashier\Cashier;
use Laravel\Cashier\SubscriptionBuilder;
use ReflectionMethod;
use Stripe\Checkout\Session;
use Throwable;
use function Sentry\captureException;

class RegisterController extends Controller
{
    public function __construct(private readonly CompanyService $companyService)
    {
    }

    /**
     * @param RegisterRequest $request
     * @return Response
     * @throws Throwable
     */
    public function validateRegisterForm(RegisterRequest $request): Response
    {
        $appFrontendUrl = config('app.frontend_url');
        $appBackendUrl = config('app.url');

        $formData = $request->validated();

        // To lower case any email
        Arr::set($formData, 'email', Str::lower(Arr::get($formData, 'email')));

        // hash password before saving to cache
        Arr::set($formData, 'password', bcrypt(Arr::get($formData, 'password')));

        // In E2E we can't pay via Stipe due to Stripe Checkout is not supported in an iframe
        if (env('GITLAB_CI', false)) return $this->registerViaE2E($formData);

        // store form data in our cache since Stripe has limits to metadata
        $uuid = Str::orderedUuid();
        Cache::put($uuid, $formData, now()->addDay());

        $stripeSessionData = [
            'success_url'           => "$appBackendUrl/stripe-success?session_id={CHECKOUT_SESSION_ID}",
            'cancel_url'            => "$appFrontendUrl/register",
            'line_items'            => [['price' => $request->validated('stripe_price_id'), 'quantity' => 1,]],
            'mode'                  => 'subscription',
            'customer_email'        => $request->validated('email'),
            'metadata'              => ['uuid' => $uuid],
            'allow_promotion_codes' => true,
        ];

        if ($request->validated('with_trial', false)) Arr::set($stripeSessionData, 'subscription_data.trial_period_days', 14);

        $stripeSession = Cashier::stripe()->checkout->sessions->create($stripeSessionData);

        return response(['url' => $stripeSession->url]);
    }

    /**
     * @param Request $request
     * @return Response|RedirectResponse
     */
    public function handleStripeSuccess(Request $request): Response|RedirectResponse
    {
        try {
            $stripeSession = Cashier::stripe()->checkout->sessions->retrieve($request->input('session_id'), ['expand' => ['subscription.plan.product', 'customer']]);
            $formData = Cache::pull($stripeSession->metadata->uuid);

            // Ensure the session payment is paid and complete
            if ($stripeSession->payment_status !== Session::PAYMENT_STATUS_PAID || $stripeSession->status !== Session::STATUS_COMPLETE)
                throw new UserException('Payment is not paid or complete');

            //
            if (User::whereEmail(Arr::get($formData, 'email'))->first()) throw new UserException('The email has already been taken.');

            // Set some additional data
            Arr::set($formData, 'company.subscription_type', $stripeSession->subscription->plan->product->metadata->limitName);

            $userData = Arr::only($formData, ['firstname', 'lastname', 'email', 'password']);
            Arr::set($userData, 'stripe_checkout_sessions', [$stripeSession->toArray()]);
            Arr::set($userData, 'stripe_id', $stripeSession->customer->id);

            // Pay attention the $userData has already hashed password
            $user = User::create($userData);

            // Create subscription in CB DB
            $rm = new ReflectionMethod('\Laravel\Cashier\SubscriptionBuilder', 'createSubscription');
            $rm->setAccessible(true);
            $rm->invoke(new SubscriptionBuilder($user, 'default'), $stripeSession->subscription);

            $this->companyService->createCompany($user, Arr::get($formData, 'company'), Arr::get($formData, 'address'));
        } catch (Throwable $exception) {
            captureException($exception);
            return response(['message' => $exception->getMessage()], 400);
        }

        try {
            // Sending emails should not interrupt creation process
            event(new Registered($user));
        } catch (Throwable) {
        }

        Cache::put('stripe_session_id', $stripeSession->id, now()->addMinutes(5));
        return redirect(config('app.frontend_url') . "/subscribe-success?session_id={$stripeSession->id}");
    }

    /**
     * @param array $formData
     * @return Response
     */
    private function registerViaE2E(array $formData): Response
    {
        try {
            // Pay attention the $formData has already hashed password
            $user = User::create(Arr::only($formData, ['firstname', 'lastname', 'email', 'password']));
            $this->companyService->createCompany($user, Arr::get($formData, 'company'), Arr::get($formData, 'address'));
        } catch (Throwable $exception) {
            captureException($exception);
            return response(['message' => $exception->getMessage()], 400);
        }

        try {
            // Sending emails should not interrupt creation process
            event(new Registered($user));
        } catch (Throwable) {
        }

        return response(['url' => config('app.frontend_url') . '/login']);
    }


    /**
     * @param Request $request
     * @return Response
     */
    public function handleStripeThankYouPage(Request $request): Response
    {
        try {
            $stripe_session_id = Cache::pull('stripe_session_id');
            if (!$stripe_session_id) throw new UserException('Stripe Session expired');

            $stripeSession = Cashier::stripe()->checkout->sessions->retrieve($request->input('session_id'), ['expand' => ['subscription']]);
            if ($stripeSession->id !== $stripe_session_id) throw new UserException('Stripe Session expired');

            return response([
                'order_id'       => $stripeSession->subscription->id,
                'order_subtotal' => $stripeSession->amount_total / 100,
            ]);

        } catch (Throwable $exception) {
            captureException($exception);
            return response(['message' => $exception->getMessage()], 400);
        }
    }
}
