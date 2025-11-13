<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TokenService;
use App\Models\EventParticipant;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class TokenController extends Controller
{
    protected $tokenService;

    public function __construct(TokenService $tokenService)
    {
        $this->tokenService = $tokenService;
    }

    /**
     * Generate and send token for participant
     */
    public function generateToken(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'event_id' => 'required|exists:events,id',
            'participant_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data tidak valid',
                'errors' => $validator->errors()
            ], 400);
        }

        try {
            $eventParticipant = EventParticipant::where('event_id', $request->event_id)
                                               ->where('participant_id', $request->participant_id)
                                               ->first();

            if (!$eventParticipant) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Peserta tidak ditemukan untuk event ini'
                ], 404);
            }

            // Check if token already exists and is still valid
            if ($eventParticipant->attendance_token && $eventParticipant->isTokenValid()) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Token sudah ada dan masih berlaku',
                    'token' => $eventParticipant->attendance_token,
                    'expires_at' => $eventParticipant->token_expires_at
                ]);
            }

            // Generate new token
            $token = $this->tokenService->generateAndSendToken($eventParticipant);

            return response()->json([
                'status' => 'success',
                'message' => 'Token berhasil dikirim ke email',
                'token' => $token,
                'expires_at' => $eventParticipant->token_expires_at
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to generate token', [
                'event_id' => $request->event_id,
                'participant_id' => $request->participant_id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengirim token. Silakan coba lagi.'
            ], 500);
        }
    }

    /**
     * Verify token for attendance
     */
    public function verifyToken(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string|size:10',
            'event_id' => 'required|exists:events,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data tidak valid',
                'errors' => $validator->errors()
            ], 400);
        }

        try {
            $result = $this->tokenService->verifyTokenForAttendance(
                $request->token,
                $request->event_id
            );

            if ($result['success']) {
                return response()->json([
                    'status' => 'success',
                    'message' => $result['message'],
                    'participant' => $result['participant']
                ]);
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => $result['message']
                ], 400);
            }

        } catch (\Exception $e) {
            Log::error('Failed to verify token', [
                'token' => $request->token,
                'event_id' => $request->event_id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memverifikasi token. Silakan coba lagi.'
            ], 500);
        }
    }

    /**
     * Get token status for participant
     */
    public function getTokenStatus(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'event_id' => 'required|exists:events,id',
            'participant_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data tidak valid',
                'errors' => $validator->errors()
            ], 400);
        }

        try {
            $status = $this->tokenService->getTokenStatus(
                $request->participant_id,
                $request->event_id
            );

            if (!$status) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Peserta tidak ditemukan untuk event ini'
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'data' => $status
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get token status', [
                'event_id' => $request->event_id,
                'participant_id' => $request->participant_id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mendapatkan status token'
            ], 500);
        }
    }

    /**
     * Resend token email
     */
    public function resendToken(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'event_id' => 'required|exists:events,id',
            'participant_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data tidak valid',
                'errors' => $validator->errors()
            ], 400);
        }

        try {
            $eventParticipant = EventParticipant::where('event_id', $request->event_id)
                                               ->where('participant_id', $request->participant_id)
                                               ->first();

            if (!$eventParticipant) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Peserta tidak ditemukan untuk event ini'
                ], 404);
            }

            // Generate and send new token
            $token = $this->tokenService->generateAndSendToken($eventParticipant);

            return response()->json([
                'status' => 'success',
                'message' => 'Token berhasil dikirim ulang ke email',
                'token' => $token,
                'expires_at' => $eventParticipant->token_expires_at
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to resend token', [
                'event_id' => $request->event_id,
                'participant_id' => $request->participant_id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengirim ulang token. Silakan coba lagi.'
            ], 500);
        }
    }
}
