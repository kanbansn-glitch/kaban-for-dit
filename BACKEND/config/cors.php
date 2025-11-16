<?php

$origins = array_values(array_filter([
    env('FRONTEND_URL', 'http://localhost:5173'),
    env('FRONTEND_URL_ALT'),
    env('APP_URL', 'http://localhost'),
], static fn ($origin) => is_string($origin) && $origin !== ''));

return [
    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Configure CORS so that frontend clients can communicate with the API
    | without encountering browser-side cross-origin errors.
    |
    */

    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
    ],

    'allowed_methods' => ['*'],

    'allowed_origins' => $origins,

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
