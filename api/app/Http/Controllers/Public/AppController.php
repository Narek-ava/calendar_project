<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Services\SubscriptionLimitsService;
use Cache;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Laravel\Cashier\Cashier;
use Throwable;

class AppController extends Controller
{
    /**
     * Some data for FE initialization
     * @param Request $request
     * @return Response
     * @throws Throwable
     */
    public function show(Request $request): Response
    {
        // Cache Stripe Products for #
        if ($request->has('refreshProducts')) Cache::store('redis')->forget('stripeProducts');

        $stripeProductsOptions = ['active' => true, ['expand' => ['data.default_price']]];
        $stripeProducts = Cache::store('redis')->remember(
            'stripeProducts',
            now()->addHours(1),
            fn() => Cashier::stripe()->products->all($stripeProductsOptions)->data
        );

        $result = [
            'stripe' => [
                'publishableKey' => env('STRIPE_KEY'),
                'products'       => $stripeProducts,
            ],
            'limits' => SubscriptionLimitsService::$defaultLimits
        ];

        return response($result);
    }
}
