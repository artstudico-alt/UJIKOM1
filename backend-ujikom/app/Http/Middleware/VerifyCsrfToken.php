<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    protected $except = [
        'email/verify/*',
        'verify-email',
        'login',
        'register',
        'logout',
        'password/email',
        'password/reset/*',
        'sanctum/csrf-cookie'
    ];
}
