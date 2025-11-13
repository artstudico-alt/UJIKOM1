<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsEventOrganizer
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Allow access if the user is an event_organizer or an admin
        if (!$user || !in_array($user->role, ['event_organizer', 'admin'])) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Forbidden: Anda bukan Event Organizer.'], 403);
            }
            return redirect()->route('login')->with('error', 'Anda tidak memiliki akses sebagai Event Organizer.');
        }

        return $next($request);
    }
}
