<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Symfony\Component\HttpFoundation\Response;

class SessionTimeoutMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated
        if (Auth::check()) {
            $lastActivity = Session::get('last_activity');
            $timeout = 60 * 60; // 60 minutes in seconds (increased from 5 minutes)

            // If last activity is not set, set it to now
            if (!$lastActivity) {
                Session::put('last_activity', time());
            } else {
                // Check if session has expired
                if (time() - $lastActivity > $timeout) {
                    // Session expired, logout user
                    Auth::logout();
                    Session::flush();

                    // Return JSON response for API requests
                    if ($request->expectsJson()) {
                        return response()->json([
                            'status' => 'error',
                            'message' => 'Session expired. Please login again.',
                            'code' => 'SESSION_EXPIRED'
                        ], 401);
                    }

                    // Redirect to login for web requests
                    return redirect()->route('login')->with('error', 'Session expired. Please login again.');
                }
            }

            // Update last activity time
            Session::put('last_activity', time());
        }

        return $next($request);
    }
}
