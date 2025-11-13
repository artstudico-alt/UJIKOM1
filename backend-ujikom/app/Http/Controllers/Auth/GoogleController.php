<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback()
    {
        $googleUser = Socialite::driver('google')->user();

        $user = User::firstOrCreate(
            ['email' => strtolower($googleUser->getEmail())],
            [
                'name' => $googleUser->getName() ?: $googleUser->getNickname() ?: 'User',
                'password' => Hash::make(Str::random(32)),
                'email_verified_at' => now(),
                'is_admin' => false,
                'status' => 'active',
            ]
        );

        Auth::login($user, true);
        request()->session()->regenerate();

        $target = $user->is_admin ? route('admin.dashboard') : route('dashboard');
        return redirect()->to($target);
    }
}
