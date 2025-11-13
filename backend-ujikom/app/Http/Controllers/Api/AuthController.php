<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Auth\Events\PasswordReset;
use App\Models\User;
use App\Notifications\EmailVerificationNotification;
use Illuminate\Support\Str;
use Illuminate\Http\JsonResponse;

class AuthController extends Controller
{
    /**
     * Handle a login request for the API.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request): JsonResponse
    {
        try {
            $credentials = $request->validate([
                'email' => 'required|email',
                'password' => 'required',
            ], [
                'email.required' => 'Email harus diisi.',
                'email.email' => 'Format email tidak valid.',
                'password.required' => 'Password harus diisi.',
            ]);

            $credentials['email'] = strtolower(trim($credentials['email']));

            $user = User::where('email', $credentials['email'])->first();

            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Email atau password salah.',
                ], 401);
            }

            if ($user->status !== 'active') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Akun Anda tidak aktif. Silakan hubungi administrator.',
                ], 401);
            }

            if (!Hash::check($credentials['password'], $user->password)) {
                Log::warning('Login gagal - Password salah', [
                    'email' => $credentials['email'],
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent()
                ]);
                
                return response()->json([
                    'status' => 'error',
                    'message' => 'Email atau password salah.',
                ], 401);
            }

            if (!$user->hasVerifiedEmail()) {
                if (!$user->verification_code || ($user->verification_code_expires_at && $user->verification_code_expires_at->isPast())) {
                    $verificationCode = $user->generateVerificationCode();
                    $user->notify(new EmailVerificationNotification($verificationCode));
                }
                
                return response()->json([
                    'status' => 'error',
                    'message' => 'Silakan verifikasi email Anda terlebih dahulu.',
                    'needs_verification' => true,
                ], 401);
            }

            // Create token for API authentication
            $token = $user->createToken('auth-token')->plainTextToken;

            Log::info('Login berhasil', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip' => $request->ip()
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Login berhasil',
                'data' => [
                    'user' => $user,
                    'token' => $token,
                ],
            ], 200);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data tidak valid',
                'errors' => $e->errors(),
            ], 422);
                
        } catch (\Exception $e) {
            Log::error('Login error - ' . $e->getMessage(), [
                'exception' => $e,
                'email' => $request->email,
                'ip' => $request->ip()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat login. Silakan coba lagi nanti.',
            ], 500);
        }
    }

    /**
     * Handle a registration request for the API.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request): JsonResponse
    {
        try {
            // Log the incoming request data for debugging
            Log::info('Register request received', [
                'data' => $request->all(),
                'headers' => $request->headers->all()
            ]);

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => [
                    'required',
                    'string',
                    'min:8',
                    'confirmed',
                    'regex:/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).*$/',
                ],
                'password_confirmation' => 'required|same:password',
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:500',
                'education' => 'nullable|string|max:100',
            ], [
                'name.required' => 'Nama harus diisi.',
                'name.max' => 'Nama maksimal 255 karakter.',
                'email.required' => 'Email harus diisi.',
                'email.email' => 'Format email tidak valid.',
                'email.unique' => 'Email ini sudah terdaftar.',
                'password.required' => 'Password harus diisi.',
                'password.min' => 'Password minimal 8 karakter.',
                'password.regex' => 'Password harus mengandung minimal 1 huruf kapital, 1 angka, dan 1 karakter khusus.',
                'password.confirmed' => 'Konfirmasi password tidak cocok.',
                'password_confirmation.required' => 'Konfirmasi password harus diisi.',
                'password_confirmation.same' => 'Konfirmasi password tidak cocok.',
                'phone.max' => 'Nomor telepon maksimal 20 karakter.',
                'address.max' => 'Alamat maksimal 500 karakter.',
                'education.max' => 'Pendidikan maksimal 100 karakter.',
            ]);

            DB::beginTransaction();

            $user = User::create([
                'name' => strip_tags(trim($validated['name'])),
                'email' => strtolower(trim($validated['email'])),
                'password' => Hash::make($validated['password']),
                'phone' => $validated['phone'] ?? null,
                'address' => $validated['address'] ?? null,
                'education' => $validated['education'] ?? null,
                'status' => 'active',
                'is_verified' => false,
            ]);

            $verificationCode = $user->generateVerificationCode();

            DB::commit();

            try {
                $user->notify(new EmailVerificationNotification($verificationCode));
                Log::info('Email verification sent successfully', [
                    'user_id' => $user->id,
                    'email' => $user->email
                ]);
            } catch (\Throwable $mailEx) {
                Log::warning('Gagal mengirim email verifikasi saat registrasi', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'error' => $mailEx->getMessage(),
                ]);
            }

            // Create token for API authentication
            $token = $user->createToken('auth-token')->plainTextToken;

            Log::info('User registered successfully', [
                'user_id' => $user->id,
                'email' => $user->email
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Registrasi berhasil! Silakan verifikasi email Anda.',
                'data' => [
                    'user' => $user,
                    'token' => $token,
                ],
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Registration validation failed', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Data tidak valid',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Registration error: ' . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $request->all()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat registrasi. Silakan coba lagi nanti.',
                'debug' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Handle a logout request for the API.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            if ($request->user()) {
                $request->user()->tokens()->delete();
            }
            
            return response()->json([
                'status' => 'success',
                'message' => 'Logout berhasil',
            ], 200);
            
        } catch (\Exception $e) {
            Log::error('Logout error: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat logout.',
            ], 500);
        }
    }

    /**
     * Get the authenticated user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function user(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User tidak ditemukan',
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'data' => $user,
            ], 200);
            
        } catch (\Exception $e) {
            Log::error('Get user error: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat mengambil data user.',
            ], 500);
        }
    }

    /**
     * Handle forgot password request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'email' => 'required|email',
            ]);

            $status = Password::sendResetLink(
                $request->only('email')
            );

            if ($status === Password::RESET_LINK_SENT) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Link reset password telah dikirim ke email Anda.',
                ], 200);
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Email tidak ditemukan.',
                ], 404);
            }
            
        } catch (\Exception $e) {
            Log::error('Forgot password error: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat mengirim link reset password.',
            ], 500);
        }
    }

    /**
     * Handle reset password request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function resetPassword(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'token' => 'required',
                'email' => 'required|email',
                'password' => 'required|min:8|confirmed|regex:/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).*$/',
            ]);

            $status = Password::reset(
                $request->only('email', 'password', 'password_confirmation', 'token'),
                function ($user, $password) {
                    $user->forceFill([
                        'password' => Hash::make($password)
                    ])->setRememberToken(Str::random(60));

                    $user->save();

                    event(new PasswordReset($user));
                }
            );

            if ($status === Password::PASSWORD_RESET) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Password berhasil direset.',
                ], 200);
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Token reset password tidak valid.',
                ], 400);
            }
            
        } catch (\Exception $e) {
            Log::error('Reset password error: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat reset password.',
            ], 500);
        }
    }

    /**
     * Verify email address.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function verifyEmail(Request $request): JsonResponse
    {
        try {
            $user = User::find($request->route('id'));

            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User tidak ditemukan.',
                ], 404);
            }

            if ($user->hasVerifiedEmail()) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Email sudah diverifikasi.',
                ], 200);
            }

            if ($user->markEmailAsVerified()) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Email berhasil diverifikasi.',
                ], 200);
            }

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memverifikasi email.',
            ], 500);
            
        } catch (\Exception $e) {
            Log::error('Email verification error: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat verifikasi email.',
            ], 500);
        }
    }

    /**
     * Resend email verification notification.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function resendVerificationEmail(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            if ($user->hasVerifiedEmail()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Email sudah diverifikasi.',
                ], 400);
            }

            $verificationCode = $user->generateVerificationCode();
            $user->notify(new EmailVerificationNotification($verificationCode));

            return response()->json([
                'status' => 'success',
                'message' => 'Email verifikasi telah dikirim ulang.',
            ], 200);
            
        } catch (\Exception $e) {
            Log::error('Resend verification email error: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat mengirim email verifikasi.',
            ], 500);
        }
    }

    /**
     * Update user profile.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateProfile(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'phone' => 'sometimes|string|max:20|regex:/^[0-9+\-\s()]+$/',
                'address' => 'sometimes|string|max:500',
                'education' => 'sometimes|string|in:High School,Associate Degree,Bachelor\'s Degree,Master\'s Degree,Doctorate,Other',
            ], [
                'phone.regex' => 'Format nomor telepon tidak valid.',
                'education.in' => 'Pendidikan yang dipilih tidak valid.',
            ]);

            $user->update($validated);

            return response()->json([
                'status' => 'success',
                'message' => 'Profile berhasil diperbarui',
                'data' => $user,
            ], 200);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data tidak valid',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Update profile error: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat memperbarui profile.',
            ], 500);
        }
    }

    /**
     * Update user password.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updatePassword(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            $validated = $request->validate([
                'current_password' => 'required|string',
                'new_password' => [
                    'required',
                    'string',
                    'min:8',
                    'confirmed',
                    'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).+$/',
                ],
                'new_password_confirmation' => 'required|same:new_password',
            ], [
                'new_password.regex' => 'Password harus mengandung setidaknya 1 huruf besar, 1 huruf kecil, 1 angka, dan 1 karakter khusus.',
                'new_password.confirmed' => 'Konfirmasi password tidak cocok.',
            ]);

            if (!Hash::check($validated['current_password'], $user->password)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Password saat ini tidak sesuai.',
                ], 400);
            }

            $user->update([
                'password' => Hash::make($validated['new_password']),
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Password berhasil diperbarui',
            ], 200);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data tidak valid',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Update password error: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat memperbarui password.',
            ], 500);
        }
    }

    /**
     * Verify OTP for email verification.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function verifyOTP(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
                'otp' => 'required|string|size:6',
            ], [
                'email.required' => 'Email harus diisi.',
                'email.email' => 'Format email tidak valid.',
                'otp.required' => 'Kode OTP harus diisi.',
                'otp.size' => 'Kode OTP harus 6 digit.',
            ]);

            $user = User::where('email', $validated['email'])->first();

            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Email tidak ditemukan.',
                ], 404);
            }

            if ($user->hasVerifiedEmail()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Email sudah diverifikasi.',
                ], 400);
            }

            if (!$user->verification_code || $user->verification_code !== $validated['otp']) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Kode OTP tidak valid.',
                ], 400);
            }

            if ($user->verification_code_expires_at && $user->verification_code_expires_at->isPast()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Kode OTP sudah kadaluarsa.',
                ], 400);
            }

            // Mark email as verified
            $user->verifyEmail();

            // Create token for API authentication
            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'status' => 'success',
                'message' => 'Email berhasil diverifikasi',
                'data' => [
                    'user' => $user,
                    'token' => $token,
                ],
            ], 200);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data tidak valid',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('OTP verification error: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat verifikasi OTP.',
            ], 500);
        }
    }

    /**
     * Resend OTP for email verification.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function resendOTP(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
            ], [
                'email.required' => 'Email harus diisi.',
                'email.email' => 'Format email tidak valid.',
            ]);

            $user = User::where('email', $validated['email'])->first();

            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Email tidak ditemukan.',
                ], 404);
            }

            if ($user->hasVerifiedEmail()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Email sudah diverifikasi.',
                ], 400);
            }

            // Generate new verification code
            $verificationCode = $user->generateVerificationCode();
            $user->notify(new EmailVerificationNotification($verificationCode));

            return response()->json([
                'status' => 'success',
                'message' => 'Kode OTP baru telah dikirim ke email Anda.',
            ], 200);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data tidak valid',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Resend OTP error: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat mengirim ulang OTP.',
            ], 500);
        }
    }
}
