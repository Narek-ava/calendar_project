<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Authorize.Net credentials
    |--------------------------------------------------------------------------
    |
    | Developer console
    | https://developer.authorize.net/api/reference/index.html#gettingstarted-section-section-header
    |
    |
    | Credentials can be obtained here
    | https://sandbox.authorize.net/UI/themes/sandbox/User/TransactionKey.aspx
    |
    */

    /*
    |--------------------------------------------------------------------------
    | API Login ID
    |--------------------------------------------------------------------------
    |
    | Merchant’s unique API Login ID.
    | The merchant API Login ID is provided in the Merchant Interface and must be stored securely.
    | The API Login ID and Transaction Key together provide the merchant authentication required for access to the payment gateway.
    |
    */
    'api_login_id' => env('AUTHNET_API_LOGIN_ID'),

    /*
    |--------------------------------------------------------------------------
    | Transaction Key
    |--------------------------------------------------------------------------
    |
    | Merchant’s unique Transaction Key.
    | The merchant Transaction Key is provided in the Merchant Interface and must be stored securely.
    | The API Login ID and Transaction Key together provide the merchant authentication required for access to the payment gateway.
    |
    */
    'transaction_key' => env('AUTHNET_TRANSACTION_KEY'),
];
