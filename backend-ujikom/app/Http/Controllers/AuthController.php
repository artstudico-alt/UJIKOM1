<?php

namespace App\Http\Controllers;

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

class AuthController extends Controller
{
    /**
     * Show the registration form
     *
     * @return \Illuminate\View\View
     */
    public function showRegistrationForm()
    {
        return view('auth.register');
    }

    /**
     * Handle a registration request for the application.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function register(Request $request)
    {
        try {
            // Validasi input
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => [
                    'required',
                    'string',
                    'min:8',
                    'confirmed',
                    'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).+$/',
                ],
                'password_confirmation' => 'required|same:password',
                'phone' => 'required|string|max:20|regex:/^[0-9+\-\s()]+$/',
                'address' => 'required|string|max:500',
                'education' => 'required|string|in:High School,Associate Degree,Bachelor\'s Degree,Master\'s Degree,Doctorate,Other',
            ], [
                'password.regex' => 'Password harus mengandung setidaknya 1 huruf besar, 1 huruf kecil, 1 angka, dan 1 karakter khusus.',
                'phone.regex' => 'Format nomor telepon tidak valid.',
                'education.in' => 'Pendidikan yang dipilih tidak valid.',
                'email.unique' => 'Email ini sudah terdaftar.',
                'password.confirmed' => 'Konfirmasi password tidak cocok.',
            ]);

            DB::beginTransaction();

            // Buat user baru
            $user = User::create([
                'name' => strip_tags(trim($validated['name'])),
                'email' => strtolower(trim($validated['email'])),
                'password' => Hash::make($validated['password']),
                'phone' => preg_replace('/[^0-9+]/', '', $validated['phone']),
                'address' => strip_tags(trim($validated['address'])),
                'education' => $validated['education'],
                'status' => 'active',
                'is_verified' => false,
            ]);

            // Generate OTP (kirim email setelah commit)
            $verificationCode = $user->generateVerificationCode();

            DB::commit();

            try {
                $user->notify(new EmailVerificationNotification($verificationCode));
            } catch (\Throwable $mailEx) {
                Log::warning('Gagal mengirim email verifikasi saat registrasi', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'error' => $mailEx->getMessage(),
                ]);
            }

            // Login user secara otomatis dan arahkan ke halaman verifikasi
            Auth::login($user);

            return redirect()->route('verification.form')
                ->with('status', 'Registrasi berhasil! Kami telah mengirimkan kode verifikasi (OTP) ke email Anda. Silakan verifikasi email Anda.');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Registration error: ' . $e->getMessage());
            
            return back()->withInput()
                ->withErrors(['error' => 'Terjadi kesalahan saat registrasi: ' . $e->getMessage()]);
        }
    }

    public function login(Request $request)
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
                return back()
                    ->withErrors(['email' => 'Email atau password salah.'])
                    ->withInput($request->except('password'));
            }

            if ($user->status !== 'active') {
                return back()
                    ->withErrors(['email' => 'Akun Anda tidak aktif. Silakan hubungi administrator.'])
                    ->withInput($request->except('password'));
            }

            if (!Hash::check($credentials['password'], $user->password)) {
                Log::warning('Login gagal - Password salah', [
                    'email' => $credentials['email'],
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent()
                ]);
                
                return back()
                    ->withErrors(['email' => 'Email atau password salah.'])
                    ->withInput($request->except('password'));
            }

            if (!$user->hasVerifiedEmail()) {
                if (!$user->verification_code || ($user->verification_code_expires_at && $user->verification_code_expires_at->isPast())) {
                    $verificationCode = $user->generateVerificationCode();
                    $user->notify(new EmailVerificationNotification($verificationCode));
                }
                
                // Login user dan arahkan ke halaman verifikasi
                Auth::login($user);
                return redirect()->route('verification.form')
                    ->with('status', 'Silakan verifikasi email Anda terlebih dahulu. Kode verifikasi telah dikirim ulang ke email Anda.');
            }

            if (Auth::attempt($credentials, $request->filled('remember'))) {
                $request->session()->regenerate();
                
                Log::info('Login berhasil', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'ip' => $request->ip()
                ]);
                
                $intended = $request->session()->pull('url.intended', route('dashboard'));
                return redirect()->intended($intended);
            }
            
            throw new \Exception('Login gagal karena alasan tidak terduga');
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()
                ->withErrors($e->errors())
                ->withInput($request->except('password'));
                
        } catch (\Exception $e) {
            Log::error('Login error - ' . $e->getMessage(), [
                'exception' => $e,
                'email' => $request->email,
                'ip' => $request->ip()
            ]);
            
            return back()
                ->withErrors(['error' => 'Terjadi kesalahan saat login. Silakan coba lagi nanti.'])
                ->withInput($request->except('password'));
        }
    }

    public function logout(Request $request)
    {
        try {
            if ($request->user()) {
                $request->user()->tokens()->delete();
            }
            
            Auth::logout();
            
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            
            return redirect()->route('login')
                ->with('status', 'Anda telah berhasil logout.');
                
        } catch (\Exception $e) {
            Log::error('Logout error - ' . $e->getMessage(), [
                'exception' => $e,
                'user_id' => Auth::id(),
                'ip' => $request->ip()
            ]);
            
            Auth::logout();
            $request->session()->invalidate();
            
            return redirect()->route('login')
                ->with('status', 'Anda telah berhasil logout.');
        }
    }

    public function sendResetLinkEmail(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        return $status === Password::RESET_LINK_SENT
            ? back()->with('status', __($status))
            : back()->withErrors(['email' => __($status)]);
    }

    public function resetPassword(Request $request)
    {
        Log::info('Reset password request received', [
            'email' => $request->email,
            'token' => $request->token ? 'token provided' : 'no token',
            'ip' => $request->ip()
        ]);
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => [
                'required',
                'confirmed',
                'min:8',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).+$/'
            ],
        ], [
            'password.regex' => 'Password harus mengandung setidaknya 1 huruf besar, 1 huruf kecil, 1 angka, dan 1 karakter khusus.'
        ]);

        $normalizedEmail = strtolower(trim($request->input('email')));
        $payload = [
            'email' => $normalizedEmail,
            'password' => $request->input('password'),
            'password_confirmation' => $request->input('password_confirmation'),
            'token' => $request->input('token'),
        ];

        $status = Password::reset(
            $payload,
            function ($user, $password) {
                try {
                    $oldHash = $user->password;
                    $user->forceFill([
                        'password' => Hash::make($password)
                    ])->setRememberToken(Str::random(60));

                    $user->save();

                    Log::info('Password reset saved for user', [
                        'user_id' => $user->id,
                        'email' => $user->email,
                        'hash_changed' => $oldHash !== $user->password,
                        'updated_at' => $user->updated_at,
                    ]);

                    event(new PasswordReset($user));
                } catch (\Throwable $e) {
                    Log::error('Password reset save error', [
                        'user_id' => $user->id ?? null,
                        'email' => $user->email ?? null,
                        'error' => $e->getMessage(),
                    ]);
                    throw $e;
                }
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            Auth::logout();
            
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            
            return redirect()->route('login')
                ->with('status', 'Kata sandi Anda berhasil diubah. Silakan login dengan kata sandi baru.');
        }
        
        return back()
            ->withInput($request->only('email'))
            ->withErrors(['email' => [__($status)]]);
        }
}
