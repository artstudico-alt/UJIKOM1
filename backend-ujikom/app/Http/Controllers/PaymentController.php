<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Event;
use App\Models\Participant;
use App\Services\DokuPaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Carbon\Carbon;

class PaymentController extends Controller
{
    private DokuPaymentService $dokuService;

    public function __construct(DokuPaymentService $dokuService)
    {
        $this->dokuService = $dokuService;
    }

    /**
     * Get available payment methods
     */
    public function getPaymentMethods()
    {
        return response()->json([
            'success' => true,
            'data' => $this->dokuService->getPaymentMethods(),
        ]);
    }

    /**
     * Create payment for account upgrade to Event Organizer
     */
    public function createUpgradePayment(Request $request)
    {
        $request->validate([
            'payment_method' => 'required|in:virtual_account,ewallet,qris',
            'payment_channel' => 'required|string',
            'amount' => 'required|numeric|min:1',
        ]);

        try {
            $user = $request->user();

            // Check if user is already event organizer or admin
            if ($user->role === 'event_organizer' || $user->role === 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Akun Anda sudah Event Organizer',
                ], 400);
            }

            // Check if user already has pending upgrade payment
            $existingPayment = Payment::where('user_id', $user->id)
                ->where('event_id', null) // Null event_id means account upgrade
                ->where('payment_status', 'pending')
                ->first();

            if ($existingPayment && !$existingPayment->isExpired()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Anda sudah memiliki pembayaran upgrade yang pending',
                    'data' => [
                        'payment' => $existingPayment,
                    ],
                ]);
            }

            // Calculate amount with fee
            $amountDetails = $this->dokuService->calculateTotalAmount(
                $request->amount,
                $request->payment_method,
                $request->payment_channel
            );

            // Generate invoice number for upgrade
            $invoiceNumber = 'INV-UPGRADE-' . strtoupper(Str::random(8)) . '-' . time();

            // Create payment in database (event_id is null for upgrade)
            $payment = Payment::create([
                'user_id' => $user->id,
                'event_id' => null, // NULL for account upgrade
                'invoice_number' => $invoiceNumber,
                'amount' => $amountDetails['total_amount'],
                'payment_method' => $request->payment_method,
                'payment_channel' => $request->payment_channel,
                'payment_status' => 'pending',
                'expired_at' => Carbon::now()->addHours(24),
                'metadata' => json_encode(['type' => 'account_upgrade', 'plan' => 'event_organizer']),
            ]);

            // Create payment request to DOKU
            $dokuPayload = [
                'invoice_number' => $invoiceNumber,
                'amount' => $amountDetails['total_amount'],
                'payment_method' => strtoupper($request->payment_method),
                'payment_channel' => strtoupper($request->payment_channel),
                'customer_name' => $user->name,
                'customer_email' => $user->email,
                'customer_phone' => $user->phone ?? '',
                'description' => 'Upgrade to Event Organizer Pro',
            ];

            $dokuResponse = $this->dokuService->createPayment($dokuPayload);

            // Update payment with DOKU response
            $payment->update([
                'doku_transaction_id' => $dokuResponse['transaction_id'] ?? null,
                'doku_payment_code' => $dokuResponse['payment_code'] ?? null,
                'payment_url' => $dokuResponse['payment_url'] ?? null,
                'qr_code_url' => $dokuResponse['qr_code_url'] ?? null,
                'payment_instructions' => $dokuResponse['instructions'] ?? null,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Payment upgrade berhasil dibuat',
                'data' => [
                    'payment' => $payment->fresh(),
                    'amount_details' => $amountDetails,
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Create Upgrade Payment Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat payment upgrade: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create payment for event registration
     */
    public function createPayment(Request $request)
    {
        $request->validate([
            'event_id' => 'required|exists:events,id',
            'payment_method' => 'required|in:virtual_account,ewallet,qris',
            'payment_channel' => 'required|string',
        ]);

        try {
            $user = $request->user();
            $event = Event::findOrFail($request->event_id);

            // Check if event requires payment
            if (!$event->price || $event->price <= 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Event ini gratis, tidak memerlukan pembayaran',
                ], 400);
            }

            // Check if user already has pending payment
            $existingPayment = Payment::where('user_id', $user->id)
                ->where('event_id', $event->id)
                ->where('payment_status', 'pending')
                ->first();

            if ($existingPayment && !$existingPayment->isExpired()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Anda sudah memiliki pembayaran yang pending',
                    'data' => $existingPayment,
                ]);
            }

            // Calculate amount with fee
            $amountDetails = $this->dokuService->calculateTotalAmount(
                $event->price,
                $request->payment_method,
                $request->payment_channel
            );

            // Generate invoice number
            $invoiceNumber = 'INV-' . strtoupper(Str::random(8)) . '-' . time();

            // Create payment in database
            $payment = Payment::create([
                'user_id' => $user->id,
                'event_id' => $event->id,
                'invoice_number' => $invoiceNumber,
                'amount' => $amountDetails['total_amount'],
                'payment_method' => $request->payment_method,
                'payment_channel' => $request->payment_channel,
                'payment_status' => 'pending',
                'expired_at' => Carbon::now()->addHours(24),
            ]);

            // Create payment request to DOKU
            $dokuPayload = [
                'invoice_number' => $invoiceNumber,
                'amount' => $amountDetails['total_amount'],
                'payment_method' => strtoupper($request->payment_method),
                'payment_channel' => strtoupper($request->payment_channel),
                'customer_name' => $user->name,
                'customer_email' => $user->email,
                'customer_phone' => $user->phone ?? '',
            ];

            Log::info('Creating DOKU payment:', $dokuPayload);

            $dokuResponse = null;
            try {
                $dokuResponse = $this->dokuService->createPayment($dokuPayload);
                Log::info('DOKU Response:', $dokuResponse);

                // Update payment with DOKU response
                $payment->update([
                    'doku_transaction_id' => $dokuResponse['transaction_id'] ?? null,
                    'doku_payment_code' => $dokuResponse['payment_code'] ?? null,
                    'payment_url' => $dokuResponse['payment_url'] ?? null,
                    'qr_code_url' => $dokuResponse['qr_code_url'] ?? null,
                    'payment_instructions' => $dokuResponse['instructions'] ?? null,
                    'metadata' => $dokuResponse,
                ]);
            } catch (\Exception $e) {
                Log::error('DOKU Payment Creation Failed: ' . $e->getMessage());
                // Continue without DOKU details for development
                Log::info('Continuing with payment creation in mock mode');
            }

            $paymentData = $payment->fresh();

            Log::info('Payment Created Successfully:', [
                'invoice_number' => $paymentData->invoice_number,
                'amount' => $paymentData->amount,
                'user_id' => $paymentData->user_id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Payment berhasil dibuat',
                'data' => [
                    'payment' => $paymentData,
                    'amount_details' => $amountDetails,
                    'event' => $event->only(['id', 'title', 'price']),
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Create Payment Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat payment: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check payment status
     */
    public function checkStatus(Request $request, string $invoiceNumber)
    {
        try {
            $payment = Payment::where('invoice_number', $invoiceNumber)
                ->with(['event', 'user'])
                ->firstOrFail();

            // Check if payment is expired
            if ($payment->isExpired() && $payment->isPending()) {
                $payment->markAsExpired();
            }

            // If still pending, check with DOKU
            if ($payment->isPending()) {
                try {
                    $dokuStatus = $this->dokuService->checkPaymentStatus($invoiceNumber);

                    if (isset($dokuStatus['status'])) {
                        if ($dokuStatus['status'] === 'SUCCESS') {
                            $payment->markAsSuccess();

                            // Check if this is account upgrade payment
                            $metadata = is_string($payment->metadata) ? json_decode($payment->metadata, true) : $payment->metadata;

                            if (isset($metadata['type']) && $metadata['type'] === 'account_upgrade') {
                                // Upgrade user role to event_organizer
                                $this->upgradeUserRole($payment->user_id, 'event_organizer');
                                Log::info("User {$payment->user_id} upgraded to event_organizer after status check");
                            } else {
                                // Regular event registration
                                $this->registerUserToEvent($payment->user_id, $payment->event_id);
                            }

                        } elseif ($dokuStatus['status'] === 'FAILED') {
                            $payment->markAsFailed();
                        }
                    }
                } catch (\Exception $e) {
                    Log::warning('DOKU Status Check Failed: ' . $e->getMessage());
                }
            }

            return response()->json([
                'success' => true,
                'data' => $payment->fresh(),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Payment tidak ditemukan',
            ], 404);
        }
    }

    /**
     * Handle payment callback from DOKU
     */
    public function callback(Request $request)
    {
        try {
            Log::info('DOKU Callback Received', $request->all());

            // Verify signature
            if (!$this->dokuService->verifySignature($request->all())) {
                Log::error('Invalid DOKU Signature');
                return response()->json(['message' => 'Invalid signature'], 401);
            }

            $invoiceNumber = $request->input('invoice_number');
            $status = $request->input('status');

            $payment = Payment::where('invoice_number', $invoiceNumber)->firstOrFail();

            // Update payment status based on DOKU callback
            if ($status === 'SUCCESS') {
                $payment->markAsSuccess();

                // Check if this is account upgrade payment
                $metadata = is_string($payment->metadata) ? json_decode($payment->metadata, true) : $payment->metadata;

                if (isset($metadata['type']) && $metadata['type'] === 'account_upgrade') {
                    // Upgrade user role to event_organizer
                    $this->upgradeUserRole($payment->user_id, 'event_organizer');
                    Log::info("User {$payment->user_id} upgraded to event_organizer after payment success");
                } else {
                    // Regular event registration
                    $this->registerUserToEvent($payment->user_id, $payment->event_id);
                }

                // TODO: Send email notification

            } elseif ($status === 'FAILED') {
                $payment->markAsFailed();
            }

            return response()->json(['message' => 'Callback processed']);

        } catch (\Exception $e) {
            Log::error('DOKU Callback Error: ' . $e->getMessage());
            return response()->json(['message' => 'Error processing callback'], 500);
        }
    }

    /**
     * Register user to event after successful payment
     */
    private function registerUserToEvent(int $userId, int $eventId, ?array $registrationData = null): void
    {
        try {
            // Check if already registered (use EventParticipant model)
            $existingParticipant = \App\Models\EventParticipant::where('participant_id', $userId)
                ->where('event_id', $eventId)
                ->first();

            if ($existingParticipant) {
                Log::info("User {$userId} already registered to event {$eventId}");
                return;
            }

            // Prepare participant data for event_participant table
            $participantData = [
                'participant_id' => $userId, // Use participant_id, not user_id
                'event_id' => $eventId,
                // registration_number, attendance_token, attendance_status will be auto-generated by boot method
            ];

            // Create participant record using EventParticipant model
            $eventParticipant = \App\Models\EventParticipant::create($participantData);

            // Update status to 'registered' (boot method sets it to 'pending')
            $eventParticipant->update(['attendance_status' => 'registered']);

            Log::info("User {$userId} successfully registered to event {$eventId} via EventParticipant", [
                'has_registration_data' => !empty($registrationData),
                'table' => 'event_participant',
                'registration_number' => $eventParticipant->registration_number,
                'attendance_token' => $eventParticipant->attendance_token
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to register user to event: " . $e->getMessage());
            Log::error("Stack trace: " . $e->getTraceAsString());
        }
    }

    /**
     * Upgrade user role after successful payment
     */
    private function upgradeUserRole(int $userId, string $newRole): void
    {
        try {
            $user = \App\Models\User::findOrFail($userId);

            // Check if already has the role
            if ($user->role === $newRole) {
                Log::info("User {$userId} already has role {$newRole}");
                return;
            }

            // Update user role
            $user->update([
                'role' => $newRole,
                'upgraded_at' => now(), // Add this field if you want to track upgrade time
            ]);

            Log::info("User {$userId} successfully upgraded to {$newRole}");

            // TODO: Send welcome email for new organizer
            // TODO: Create notification

        } catch (\Exception $e) {
            Log::error("Failed to upgrade user role: " . $e->getMessage());
        }
    }

    /**
     * Simulate payment success for development
     */
    public function simulateSuccess(Request $request, string $invoiceNumber)
    {
        try {
            $payment = Payment::where('invoice_number', $invoiceNumber)
                ->with(['user'])
                ->firstOrFail();

            // Only allow for development
            if (config('app.env') !== 'local') {
                return response()->json([
                    'success' => false,
                    'message' => 'Simulation only available in development mode',
                ], 403);
            }

            // Mark payment as success
            $payment->markAsSuccess();

            // Check if this is account upgrade payment
            $metadata = is_string($payment->metadata) ? json_decode($payment->metadata, true) : $payment->metadata;

            if (isset($metadata['type']) && $metadata['type'] === 'account_upgrade') {
                // Upgrade user role to event_organizer
                $this->upgradeUserRole($payment->user_id, 'event_organizer');
                Log::info("User {$payment->user_id} upgraded to event_organizer via simulation");
            } else {
                // Regular event registration
                // Get registration data from request if provided
                $registrationData = $request->input('registration_data');
                $this->registerUserToEvent($payment->user_id, $payment->event_id, $registrationData);
            }

            return response()->json([
                'success' => true,
                'message' => 'Payment simulated successfully',
                'data' => $payment->fresh(),
            ]);

        } catch (\Exception $e) {
            Log::error('Simulate Payment Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to simulate payment',
            ], 500);
        }
    }

    /**
     * Get user's payment history
     */
    public function getUserPayments(Request $request)
    {
        $user = $request->user();

        $payments = Payment::where('user_id', $user->id)
            ->with('event')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $payments,
        ]);
    }

    /**
     * Get all payments (Admin only)
     */
    public function getAllPayments(Request $request)
    {
        $payments = Payment::with(['user', 'event'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $payments,
        ]);
    }

    /**
     * Cancel pending payment
     */
    public function cancelPayment(Request $request, string $invoiceNumber)
    {
        try {
            $user = $request->user();

            $payment = Payment::where('invoice_number', $invoiceNumber)
                ->where('user_id', $user->id)
                ->firstOrFail();

            if (!$payment->isPending()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Hanya payment dengan status pending yang bisa dibatalkan',
                ], 400);
            }

            $payment->markAsFailed();

            return response()->json([
                'success' => true,
                'message' => 'Payment berhasil dibatalkan',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Payment tidak ditemukan',
            ], 404);
        }
    }

    /**
     * Get all payments for organizer's events
     */
    public function getOrganizerPayments(Request $request)
    {
        try {
            $userId = auth()->id();

            // Get payments for events created by this organizer
            $query = Payment::with(['event', 'user'])
                ->whereHas('event', function($q) use ($userId) {
                    $q->where('user_id', $userId);
                })
                ->orderBy('created_at', 'desc');

            // Filter by status if provided
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('payment_status', $request->status);
            }

            // Filter by event if provided
            if ($request->has('event_id') && $request->event_id !== 'all') {
                $query->where('event_id', $request->event_id);
            }

            // Search by user name, email, or invoice number
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('invoice_number', 'like', "%{$search}%")
                      ->orWhereHas('user', function($userQuery) use ($search) {
                          $userQuery->where('name', 'like', "%{$search}%")
                                  ->orWhere('email', 'like', "%{$search}%");
                      })
                      ->orWhereHas('event', function($eventQuery) use ($search) {
                          $eventQuery->where('title', 'like', "%{$search}%");
                      });
                });
            }

            $payments = $query->paginate($request->get('per_page', 20));

            // Calculate statistics
            $stats = [
                'total_revenue' => Payment::whereHas('event', function($q) use ($userId) {
                    $q->where('user_id', $userId);
                })->where('payment_status', 'success')->sum('amount'),

                'pending_amount' => Payment::whereHas('event', function($q) use ($userId) {
                    $q->where('user_id', $userId);
                })->where('payment_status', 'pending')->sum('amount'),

                'completed_payments' => Payment::whereHas('event', function($q) use ($userId) {
                    $q->where('user_id', $userId);
                })->where('payment_status', 'success')->count(),

                'pending_payments' => Payment::whereHas('event', function($q) use ($userId) {
                    $q->where('user_id', $userId);
                })->where('payment_status', 'pending')->count(),
            ];

            // Transform payment data
            $transformedPayments = $payments->getCollection()->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'event_id' => $payment->event_id,
                    'event_title' => $payment->event->title ?? 'Unknown Event',
                    'user_name' => $payment->user->name ?? 'Unknown User',
                    'user_email' => $payment->user->email ?? '',
                    'amount' => (float) $payment->amount,
                    'payment_method' => $payment->payment_method,
                    'payment_channel' => $payment->payment_channel,
                    'status' => $payment->payment_status,
                    'transaction_id' => $payment->invoice_number,
                    'payment_date' => $payment->paid_at ? $payment->paid_at->format('Y-m-d') : null,
                    'created_at' => $payment->created_at->format('Y-m-d H:i:s'),
                ];
            });

            return response()->json([
                'status' => 'success',
                'data' => $transformedPayments,
                'stats' => $stats,
                'pagination' => [
                    'current_page' => $payments->currentPage(),
                    'last_page' => $payments->lastPage(),
                    'per_page' => $payments->perPage(),
                    'total' => $payments->total(),
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching organizer payments: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch payments',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
