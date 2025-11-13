<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureEmailIsVerified
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        if (!Auth::user()->hasVerifiedEmail()) {
            // Jika user belum verified dan mencoba akses halaman yang membutuhkan verifikasi
            // Redirect ke halaman verifikasi
            return redirect()->route('verification.form')
                ->with('status', 'Silakan verifikasi email Anda terlebih dahulu.');
        }

        return $next($request);
    }
}
