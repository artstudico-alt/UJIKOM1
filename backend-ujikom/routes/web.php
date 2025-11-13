<?php

use Illuminate\Support\Facades\Facade;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\App;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\VerificationController;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\EventController as AdminEventController;
use App\Http\Controllers\Auth\GoogleController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Test database connection
Route::get('/test-db', function() {
    try {
        DB::connection()->getPdo();
        return 'Database connection successful!';
    } catch (\Exception $e) {
        return 'Database connection failed: ' . $e->getMessage();
    }
});

// Test route for debugging
Route::get('/test', function () {
    return response()->json([
        'php_version' => PHP_VERSION,
        'laravel_version' => App::version(),
        'environment' => App::environment(),
        'debug_mode' => config('app.debug'),
        'providers' => config('app.providers'),
        'timezone' => config('app.timezone'),
        'locale' => config('app.locale'),
    ]);
});

// Home: redirect based on auth status/role
Route::get('/', function () {
    if (auth()->check()) {
        if (auth()->user()->is_admin) {
            return redirect()->route('admin.dashboard');
        }
        return redirect()->route('dashboard');
    }
    if (!request()->is('login') && !request()->is('register')) {
        return redirect()->route('login');
    }
    return view('auth.login');
})->name('home');

// Public Event & Search routes
Route::get('/catalog', [PublicController::class, 'catalog'])->name('catalog');
Route::get('/events/{id}', [PublicController::class, 'eventDetail'])->name('events.show');
Route::get('/search/events', [PublicController::class, 'searchEvents'])->name('events.search');
Route::get('/search/certificates', [PublicController::class, 'searchCertificate'])->name('certificates.search');
Route::get('/attendance', [PublicController::class, 'attendanceView'])->name('attendance.view');

// Google OAuth (outside guest to be safe)
Route::get('/auth/google', [GoogleController::class, 'redirect'])->name('auth.google.redirect');
Route::get('/auth/google/callback', [GoogleController::class, 'callback'])->name('auth.google.callback');

/*
|--------------------------------------------------------------------------
| Guest Routes (Not Authenticated)
|--------------------------------------------------------------------------
*/
Route::middleware('guest')->group(function () {
    // Show and handle registration
    Route::get('/register', [AuthController::class, 'showRegistrationForm'])->name('register');
    Route::post('/register', [AuthController::class, 'register'])->name('register.submit');

    // Show and handle login
    Route::get('/login', function () {
        return view('auth.login');
    })->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.submit');
});

/*
|--------------------------------------------------------------------------
| Password Reset Routes (Accessible for both guests and authenticated)
|--------------------------------------------------------------------------
*/
Route::get('/forgot-password', function () {
    return view('auth.passwords.email');
})->name('password.request');
Route::post('/forgot-password', [AuthController::class, 'sendResetLinkEmail'])->name('password.email');
Route::get('/reset-password/{token}', function ($token) {
    return view('auth.passwords.reset', ['token' => $token]);
})->name('password.reset');
Route::put('/reset-password', [AuthController::class, 'resetPassword'])->name('password.reset.update');

/*
|--------------------------------------------------------------------------
| Event Organizer Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:event_organizer,admin'])->prefix('organizer')->name('organizer.')->group(function () {
    // Dashboard
    Route::get('/dashboard', [App\Http\Controllers\OrganizerController::class, 'dashboard'])->name('dashboard');
    
    // Event Management
    Route::get('/events/create', [App\Http\Controllers\OrganizerController::class, 'createEvent'])->name('events.create');
    Route::post('/events', [App\Http\Controllers\OrganizerController::class, 'storeEvent'])->name('events.store');
    Route::get('/events/{id}', [App\Http\Controllers\OrganizerController::class, 'showEvent'])->name('events.show');
    Route::get('/events/{id}/edit', [App\Http\Controllers\OrganizerController::class, 'editEvent'])->name('events.edit');
    Route::put('/events/{id}', [App\Http\Controllers\OrganizerController::class, 'updateEvent'])->name('events.update');
    Route::delete('/events/{id}', [App\Http\Controllers\OrganizerController::class, 'destroyEvent'])->name('events.destroy');
    
    // Participant Management
    Route::get('/events/{id}/participants', [App\Http\Controllers\OrganizerController::class, 'eventParticipants'])->name('events.participants');
    
    // Document Upload
    Route::post('/events/{id}/documents', [App\Http\Controllers\OrganizerController::class, 'uploadEventDocuments'])->name('events.documents.upload');
    
    // Event Report
    Route::post('/events/{id}/report', [App\Http\Controllers\OrganizerController::class, 'sendEventReport'])->name('events.report.send');
});


/*
|--------------------------------------------------------------------------
| Email Verification Routes
|--------------------------------------------------------------------------
*/
// This route is for unverified users who are already authenticated
Route::middleware(['auth'])->group(function () {
    // Show email verification notice
    Route::get('/email/verify', function () {
        if (auth()->user()->is_verified) {
            return redirect()->intended(route('dashboard'));
        }
        return view('auth.verify.notice');
    })->name('verification.notice');
    
    // Handle email verification resend
    Route::post('/email/verification-notification', [VerificationController::class, 'resend'])
        ->middleware('throttle:6,1')
        ->name('verification.send');
    
    // Handle email verification
    Route::post('/verify-email', [VerificationController::class, 'verify'])
        ->middleware('throttle:6,1')
        ->name('verification.verify');
    
    // Show verification form for unverified users
    Route::get('/verify-email', function () {
        if (auth()->user()->is_verified) {
            return redirect()->intended(route('dashboard'));
        }
        return view('auth.verify.form');
    })->name('verification.form');
    
    // Test route for debugging
    Route::get('/test-verification', function () {
        return response()->json([
            'message' => 'Test route works',
            'user' => auth()->user() ? auth()->user()->only(['id', 'email', 'is_verified']) : null
        ]);
    })->name('test.verification');
});

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/
// Routes that require authentication and verification
Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('/dashboard', function () {
        return view('dashboard');
    })->name('dashboard');
    
    // Profile
    Route::get('/profile', function () {
        return view('profile.show');
    })->name('profile.show');
    Route::put('/profile', [AuthController::class, 'updateProfile'])->name('profile.update');
    Route::put('/password', [AuthController::class, 'updatePassword'])->name('password.update');
});

// Logout should be available for all authenticated users
Route::middleware(['auth'])->post('/logout', [AuthController::class, 'logout'])->name('logout');


/*
|--------------------------------------------------------------------------
| Admin Routes (Event Management)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'is_admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', function () {
        if (!auth()->user()->is_verified) {
            return redirect()->route('verification.notice');
        }
        return app(DashboardController::class)->index();
    })->name('dashboard');
    
    // Admin routes that require verification
    Route::middleware(['verified'])->group(function () {
        Route::get('/dashboard/stats', [DashboardController::class, 'statistics'])->name('dashboard.stats');
        Route::get('/dashboard/chart-data', [DashboardController::class, 'chartData'])->name('dashboard.chart-data');
        Route::resource('events', AdminEventController::class);
        
        // Participants Management Routes
        Route::get('/participants', [App\Http\Controllers\Admin\ParticipantController::class, 'index'])->name('participants.index');
        Route::get('/participants/all', [App\Http\Controllers\Admin\ParticipantController::class, 'allParticipants'])->name('participants.all');
        Route::get('/participants/event/{event}', [App\Http\Controllers\Admin\ParticipantController::class, 'eventParticipants'])->name('participants.event');
        Route::get('/participants/export', [App\Http\Controllers\Admin\ParticipantController::class, 'export'])->name('participants.export');
        
        Route::prefix('events/{event}')->group(function () {
            Route::get('/export', [AdminEventController::class, 'export'])->name('events.export');
            Route::post('/participants', [AdminEventController::class, 'addParticipant'])->name('events.add-participant');
            Route::post('/participants/import', [AdminEventController::class, 'importParticipants'])->name('events.import-participants');
            Route::delete('/participants/{participant}', [AdminEventController::class, 'removeParticipant'])->name('events.remove-participant');
            Route::post('/participants/{participant}/attendance', [AdminEventController::class, 'markAttendance'])->name('events.mark-attendance');
            Route::post('/participants/{participant}/certificate', [AdminEventController::class, 'generateCertificate'])->name('events.generate-certificate');
            Route::post('/certificates/generate-all', [AdminEventController::class, 'generateAllCertificates'])->name('events.generate-all-certificates');
        });
        
        Route::get('/certificates/{certificate}/download', [AdminEventController::class, 'downloadCertificate'])->name('certificates.download');
        Route::get('/certificates/{certificate}', [AdminEventController::class, 'showCertificate'])->name('certificates.show');
    });
});

/*
|--------------------------------------------------------------------------
| Development Routes
|--------------------------------------------------------------------------
*/
if (app()->environment('local', 'staging')) {
    Route::options('/{any}', function () {
        return response('', 200)
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, Authorization');
    })->where('any', '.*');
    
    Route::get('/test-email', function () {
        try {
            Mail::raw('Ini adalah email test', function($message) {
                $message->to('test@example.com')
                        ->subject('Test Email');
            });
            return 'Email test berhasil dikirim!';
        } catch (\Exception $e) {
            return 'Gagal mengirim email: ' . $e->getMessage();
        }
    });
    
    Route::get('/test', function () {
        return 'Test route works!';
    });
}
