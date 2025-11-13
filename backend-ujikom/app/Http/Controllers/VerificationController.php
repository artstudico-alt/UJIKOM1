<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Notifications\EmailVerificationNotification;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;

class VerificationController extends Controller
{
    /**
     * Verify user's email with OTP code
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function verify(Request $request)
    {
        try {
            // Log the verification attempt
            Log::info('Verification attempt', [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'has_user' => Auth::check() ? 'yes' : 'no',
                'input' => $request->except(['_token']),
                'method' => $request->method(),
                'url' => $request->url(),
                'route' => $request->route()->getName()
            ]);

            // Validate the incoming request data
            $validator = Validator::make($request->all(), [
                'email' => 'required|email|exists:users,email',
                'code' => 'required|string|size:6',
            ], [
                'email.required' => 'Email harus diisi.',
                'email.exists' => 'Akun dengan email ini tidak ditemukan.',
                'code.required' => 'Kode verifikasi harus diisi.',
                'code.size' => 'Kode verifikasi harus 6 digit.',
            ]);

            if ($validator->fails()) {
                if ($request->expectsJson()) {
                    return response()->json([
                        'message' => 'Validasi gagal',
                        'errors' => $validator->errors()
                    ], 422);
                }
                return back()->withErrors($validator)->withInput();
            }

            // Find the user by email
            $user = User::where('email', $request->email)->first();

            // Handle case where user is not found
            if (!$user) {
                 return back()->withErrors(['email' => 'Akun dengan email ini tidak ditemukan.']);
            }
            
            // Check if user is already verified
            if ($user->is_verified) {
                if ($request->expectsJson()) {
                    return response()->json(['message' => 'Email sudah terverifikasi.'], 200);
                }
                // If user is already verified and trying to verify again, redirect to login
                return redirect()->route('login')
                    ->with('status', 'Email sudah terverifikasi. Silakan login.');
            }

            // Check if the code matches
            Log::info('Verification code check', [
                'user_code' => $user->verification_code,
                'input_code' => $request->code,
                'codes_match' => $user->verification_code === $request->code,
                'user_id' => $user->id
            ]);
            
            if ($user->verification_code !== $request->code) {
                // Increment failed attempts and check lockout
                $user->incrementVerificationAttempts();
                
                Log::warning('Verification code mismatch', [
                    'user_id' => $user->id,
                    'expected' => $user->verification_code,
                    'received' => $request->code
                ]);

                return back()->withErrors(['code' => 'Kode verifikasi tidak valid.']);
            }
            
            // Check if code has expired
            if ($user->verification_code_expires_at && $user->verification_code_expires_at->isPast()) {
                // Generate and send new code
                $verificationCode = $user->generateVerificationCode();
                $user->notify(new EmailVerificationNotification($verificationCode));
                
                return back()->withErrors(['code' => 'Kode verifikasi telah kedaluwarsa. Kode baru telah dikirim ke email Anda.']);
            }

            // Verify the user
            $oldVerificationStatus = $user->is_verified;
            $user->verifyEmail();
            
            // Refresh user data
            $user->refresh();

            Log::info('Email berhasil diverifikasi', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'old_verified' => $oldVerificationStatus,
                'new_verified' => $user->is_verified,
                'email_verified_at' => $user->email_verified_at,
                'verification_code' => $user->verification_code
            ]);

            // For API response
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Email berhasil diverifikasi.',
                    'user' => $user->only(['id', 'name', 'email', 'is_verified'])
                ]);
            }
            
            // For web, logout user and redirect to login with success message
            if (Auth::check()) {
                Log::info('Logging out user after verification', [
                    'user_id' => $user->id,
                    'email' => $user->email
                ]);
                
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            }
            
            Log::info('Redirecting to login after verification', [
                'route' => 'login',
                'status' => 'Email berhasil diverifikasi! Silakan login untuk melanjutkan.'
            ]);
            
            return redirect()->route('login')
                ->with('status', 'Email berhasil diverifikasi! Silakan login untuk melanjutkan.');
                
        } catch (\Exception $e) {
            Log::error('Verification error: ' . $e->getMessage(), [
                'exception' => $e,
                'email' => $request->email,
                'ip' => $request->ip()
            ]);
            
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Terjadi kesalahan saat memverifikasi email.'], 500);
            }
            
            return back()
                ->withErrors(['error' => 'Terjadi kesalahan saat memverifikasi email. Silakan coba lagi.'])
                ->withInput($request->except('code'));
        }
    }

    /**
     * Resend verification email with new OTP
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function resend(Request $request)
    {
        try {
            $user = $request->user() ?? User::where('email', $request->email)->first();
            
            if (!$user) {
                 return back()->withErrors(['email' => 'Email tidak terdaftar di sistem kami.']);
            }
            
            if ($user->is_verified) {
                return back()->with('status', 'Email Anda sudah terverifikasi.');
            }
            
            if ($user->hasReachedMaxVerificationAttempts()) {
                $lockoutTime = $user->last_verification_attempt->addMinutes(5)->diffInMinutes(now());
                $lockoutMessage = 'Terlalu banyak permintaan. Silakan coba lagi dalam ' . ceil($lockoutTime) . ' menit.';

                if ($request->expectsJson()) {
                    return response()->json(['message' => $lockoutMessage], 429);
                }
                
                return back()->withErrors(['email' => $lockoutMessage]);
            }

            // Generate and send new OTP
            $verificationCode = $user->generateVerificationCode();
            $user->notify(new EmailVerificationNotification($verificationCode));
            $user->incrementVerificationAttempts();

            Log::info('Kode verifikasi dikirim ulang', [
                'user_id' => $user->id,
                'email' => $user->email,
                'attempt' => $user->verification_attempts
            ]);

            $message = 'Kode verifikasi baru telah dikirim ke email ' . $user->email . '. Kode akan kedaluwarsa dalam 5 menit.';

            if ($request->expectsJson()) {
                return response()->json(['message' => $message]);
            }

            return back()->with('status', $message);
            
        } catch (\Exception $e) {
            Log::error('Gagal mengirim ulang kode verifikasi: ' . $e->getMessage(), ['exception' => $e, 'email' => $request->email]);
            return back()->withErrors(['error' => 'Gagal mengirim ulang kode verifikasi. Silakan coba lagi.']);
        }
    }
}
