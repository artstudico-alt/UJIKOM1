<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

class RedirectIfAuthenticated
{
    public function handle(Request $request, Closure $next, ...$guards)
    {
        $guards = empty($guards) ? [null] : $guards;

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                // Skip redirection for these routes to prevent loops
                if ($request->is('email/verify*') || $request->is('verification*')) {
                    return $next($request);
                }
                
                $user = Auth::guard($guard)->user();
                if ($user->is_admin) {
                    return redirect()->route('admin.dashboard');
                }
                return redirect()->route('dashboard');
            }
        }

        return $next($request);
    }
}
