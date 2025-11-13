<?php


return [
    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
        'login',
        'register',
        'forgot-password',
        'reset-password',
        'email/verify/*',
        'verify-email'
    ],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://172.16.2.54:3000',
        'http://10.0.2.2:3000',
        'http://localhost:8000',
        'http://127.0.0.1:8000',
        'http://172.16.2.54:8000',
        'http://10.0.2.2:8000',
        '*'
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => [
        'Origin',
        'Content-Type',
        'X-Auth-Token',
        'X-Requested-With',
        'X-CSRF-TOKEN',
        'Authorization',
        'Accept',
        'X-XSRF-TOKEN',
        'X-Socket-Id'
    ],

    'exposed_headers' => [
        'Authorization',
        'X-CSRF-TOKEN',
        'X-XSRF-TOKEN',
    ],

    'max_age' => 0,

    'supports_credentials' => true,

];
