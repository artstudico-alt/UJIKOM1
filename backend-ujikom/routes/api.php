<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\CertificateController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\TokenController;
use App\Http\Controllers\Api\CertificateDownloadController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\OrganizerController;
use App\Http\Controllers\Api\OrganizerEventController;
use App\Http\Controllers\Api\AdminEventApprovalController;
use App\Http\Controllers\PaymentController;

// Public Routes
Route::get('/events', [EventController::class, 'index']);
Route::get('/events/search', [EventController::class, 'search']);
Route::get('/events/{id}', [EventController::class, 'show']);

// Serve storage files (images) via API
Route::get('/storage/{path}', function ($path) {
    $filePath = storage_path('app/public/' . $path);

    if (!file_exists($filePath)) {
        return response()->json(['error' => 'File not found'], 404);
    }

    return response()->file($filePath, [
        'Content-Type' => mime_content_type($filePath),
        'Cache-Control' => 'public, max-age=31536000',
    ]);
})->where('path', '.*');

// Auth Routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/verify-otp', [AuthController::class, 'verifyOTP']);
Route::post('/resend-otp', [AuthController::class, 'resendOTP']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Email Verification
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
    ->middleware(['signed'])->name('verification.verify');

// Certificate Search (Public)
Route::get('/certificates/search', [CertificateController::class, 'search']);
Route::get('/certificates/verify/{certificateNumber}', [CertificateController::class, 'verify']);
Route::get('/certificates/{id}/download', [CertificateController::class, 'download']);

// Payment Callback (Public - untuk DOKU webhook)
Route::post('/payments/callback', [PaymentController::class, 'callback']);

// Protected Routes (butuh token Sanctum)
Route::middleware(['auth:sanctum', 'session.timeout'])->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // User Profile
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/profile/upload-picture', [AuthController::class, 'uploadProfilePicture']);
    Route::put('/password', [AuthController::class, 'updatePassword']);

    // Dashboard
    Route::get('/dashboard/stats', [EventController::class, 'statistics']);
    Route::get('/dashboard/chart-data', [EventController::class, 'chartData']);
    Route::get('/dashboard/export', [EventController::class, 'exportDashboard']);

    // Events
    Route::post('/events', [EventController::class, 'store']);
    Route::put('/events/{id}', [EventController::class, 'update']);
    Route::delete('/events/{id}', [EventController::class, 'destroy']);
    Route::delete('/events/{id}/force', [EventController::class, 'forceDestroy']);
    Route::post('/events/{id}/register', [EventController::class, 'register']);
    Route::post('/events/{id}/attendance', [EventController::class, 'attendance']);

    // User Events
    Route::get('/my-events', [EventController::class, 'myEvents']);
    Route::get('/my-certificates', [EventController::class, 'myCertificates']);

    // User Management (Admin only)
    Route::middleware(['admin'])->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/{user}', [UserController::class, 'show']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
        Route::post('/users/bulk-action', [UserController::class, 'bulkAction']);
        Route::get('/users/statistics', [UserController::class, 'statistics']);

        // Admin Dashboard
        Route::get('/admin/dashboard/stats', [AdminEventApprovalController::class, 'getDashboardStats']);
        Route::get('/admin/dashboard/charts', [AdminEventApprovalController::class, 'getChartData']);

        // Export Data
        Route::get('/admin/export/events', [App\Http\Controllers\Admin\DashboardController::class, 'exportEvents']);
        Route::get('/admin/export/participants', [App\Http\Controllers\Admin\DashboardController::class, 'exportParticipants']);
        Route::get('/admin/export/users', [App\Http\Controllers\Admin\DashboardController::class, 'exportUsers']);


        // Admin certificate management routes
        Route::get('/admin/events/certificates', [CertificateController::class, 'getEventsWithCertificates']);
        Route::get('/admin/events/{eventId}/certificates', [CertificateController::class, 'getEventCertificates']);
        Route::put('/admin/events/{eventId}/certificate-settings', [CertificateController::class, 'updateEventCertificateSettings']);
        Route::post('/admin/events/{eventId}/certificates/generate', [CertificateController::class, 'generateCertificate']);
        Route::post('/admin/events/{eventId}/certificates/generate-all', [CertificateController::class, 'generateAllCertificates']);
        Route::get('/admin/certificates/{certificateId}/download', [CertificateController::class, 'downloadCertificate']);

        // Admin Event Management Routes
        Route::get('/admin/events', [AdminEventApprovalController::class, 'getAllEvents']);
        Route::get('/admin/events/recent', [AdminEventApprovalController::class, 'getRecentEvents']);

        // Admin Event Approval Routes - MUST BE BEFORE DYNAMIC ROUTES
        Route::get('/admin/events/pending', [AdminEventApprovalController::class, 'getPendingEvents']);
        Route::get('/admin/events/approval-stats', [AdminEventApprovalController::class, 'getApprovalStats']);
        Route::post('/admin/events/bulk-approve', [AdminEventApprovalController::class, 'bulkApprove']);

        // Dynamic routes with {event} parameter - MUST BE AFTER SPECIFIC ROUTES
        Route::get('/admin/events/{event}', [AdminEventApprovalController::class, 'getEventById']);
        Route::post('/admin/events', [AdminEventApprovalController::class, 'createEvent']);
        Route::put('/admin/events/{event}', [AdminEventApprovalController::class, 'updateEvent']);
        Route::delete('/admin/events/{event}', [AdminEventApprovalController::class, 'deleteEvent']);
        Route::post('/admin/events/{event}/approve', [AdminEventApprovalController::class, 'approveEvent']);
        Route::post('/admin/events/{event}/reject', [AdminEventApprovalController::class, 'rejectEvent']);

        // Admin Payment Routes
        Route::get('/admin/payments', [PaymentController::class, 'getAllPayments']);
    });

    // Attendance
    Route::get('/events/{event}/attendance', [AttendanceController::class, 'index']);
    Route::post('/events/{event}/attendance/{participant}', [AttendanceController::class, 'markAttendance']);

    // Attendance Token System
    Route::get('/events/{eventId}/attendance-token', [AttendanceController::class, 'getAttendanceToken']);
    Route::post('/attendance/verify', [AttendanceController::class, 'verifyAttendance']);
    Route::get('/attendance/status', [AttendanceController::class, 'getAttendanceStatus']);

    // Token System Routes
    Route::post('/tokens/generate', [TokenController::class, 'generateToken']);
    Route::post('/tokens/verify', [TokenController::class, 'verifyToken']);
    Route::get('/tokens/status', [TokenController::class, 'getTokenStatus']);
    Route::post('/tokens/resend', [TokenController::class, 'resendToken']);

    // Certificate Download Routes
    Route::get('/certificates/{certificateId}/download', [CertificateDownloadController::class, 'download']);
    Route::get('/certificates/{certificateId}/preview', [CertificateDownloadController::class, 'preview']);
    Route::get('/certificates/{certificateId}/info', [CertificateDownloadController::class, 'info']);

    // Resend Email Verification
    Route::post('/email/verification-notification', [AuthController::class, 'resendVerificationEmail'])
        ->middleware(['throttle:6,1']);


    // Certificate Builder Routes
    Route::get('/certificate-events', [EventController::class, 'getEventsWithCertificates']);
    Route::get('/events/{eventId}/participants', [EventController::class, 'getEventParticipants']);
    Route::post('/certificates/generate-from-builder', [CertificateController::class, 'generateFromBuilder']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::get('/notifications/recent', [NotificationController::class, 'recent']);
    Route::get('/notifications/statistics', [NotificationController::class, 'statistics']);
    Route::get('/notifications/type/{type}', [NotificationController::class, 'getByType']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/{id}/unread', [NotificationController::class, 'markAsUnread']);
    Route::put('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);

    // Payment Routes
    Route::get('/payments/methods', [PaymentController::class, 'getPaymentMethods']);
    Route::post('/payments/create', [PaymentController::class, 'createPayment']);
    Route::post('/payments/upgrade', [PaymentController::class, 'createUpgradePayment']); // Upgrade account payment
    Route::get('/payments/{invoiceNumber}/status', [PaymentController::class, 'checkStatus']);
    Route::post('/payments/{invoiceNumber}/simulate-success', [PaymentController::class, 'simulateSuccess']); // For development only
    Route::get('/payments/history', [PaymentController::class, 'getUserPayments']);
    Route::post('/payments/{invoiceNumber}/cancel', [PaymentController::class, 'cancelPayment']);

    // Test route
    Route::get('/test-certificates', function() {
        return response()->json(['status' => 'success', 'message' => 'Test route works']);
    });

    // Event Organizer Routes
    Route::prefix('organizer')->group(function () {
        Route::get('/dashboard', [OrganizerController::class, 'dashboard']);

        // Organizer Event Management
        Route::get('/events', [OrganizerEventController::class, 'index']);
        Route::get('/events/statistics', [OrganizerEventController::class, 'statistics']); // ✅ Specific route FIRST
        Route::post('/events', [OrganizerEventController::class, 'store']);
        Route::get('/events/{event}', [OrganizerEventController::class, 'show']); // ✅ Dynamic route AFTER
        Route::put('/events/{event}', [OrganizerEventController::class, 'update']);
        Route::delete('/events/{event}', [OrganizerEventController::class, 'destroy']);

        // Participants Management
        Route::get('/events/{eventId}/participants', [OrganizerEventController::class, 'getParticipants']);
        Route::get('/events/{eventId}/participants/export', [OrganizerEventController::class, 'exportParticipants']);

        // Payment Management
        Route::get('/payments', [PaymentController::class, 'getOrganizerPayments']);
    });
});

