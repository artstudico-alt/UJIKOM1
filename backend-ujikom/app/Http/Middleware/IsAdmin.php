<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsAdmin
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Forbidden: Anda tidak memiliki akses admin.'], 403);
            }
            return redirect()->route('login')->with('error', 'Anda tidak memiliki akses admin.');
        }
        return $next($request);
    }
}
