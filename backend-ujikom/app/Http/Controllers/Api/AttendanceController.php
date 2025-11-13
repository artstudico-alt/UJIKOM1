<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class AttendanceController extends Controller
{
    /**
     * Get attendance list for an event
     *
     * @urlParam event_id int required The ID of the event
     * @queryParam search string Search term for participant name or email
     * @queryParam per_page int Items per page. Default: 20
     *
     * @response 200 {
     *   "data": [{"id": 1, "name": "John Doe", "email": "john@example.com", "attended_at": "2025-08-13 10:00:00"}],
     *   "meta": {...},
     *   "event": {"id": 1, "title": "Event Title", ...}
     * }
     */
    public function index(Event $event, Request $request): JsonResponse
    {
        $request->validate([
            'search' => 'sometimes|string|max:255',
            'per_page' => 'sometimes|integer|min:1|max:100',
        ]);

        $query = $event->participants()
            ->with('user')
            ->select([
                'participants.id',
                'participants.user_id',
                'participants.event_id',
                'participants.is_present',
                'participants.attended_at',
                'participants.created_at',
            ]);

        // Filter by search term
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $perPage = $request->input('per_page', 20);
        $participants = $query->paginate($perPage);

        return response()->json([
            'data' => $participants->map(function($participant) {
                return [
                    'id' => $participant->id,
                    'user_id' => $participant->user_id,
                    'name' => $participant->user->name,
                    'email' => $participant->user->email,
                    'is_present' => $participant->is_present,
                    'attended_at' => $participant->attended_at,
                    'registered_at' => $participant->created_at,
                ];
            }),
            'meta' => [
                'current_page' => $participants->currentPage(),
                'last_page' => $participants->lastPage(),
                'per_page' => $participants->perPage(),
                'total' => $participants->total(),
            ],
            'event' => [
                'id' => $event->id,
                'title' => $event->title,
                'event_date' => $event->event_date->format('Y-m-d'),
                'start_time' => $event->start_time,
                'end_time' => $event->end_time,
                'location' => $event->location,
                'total_participants' => $event->participants()->count(),
                'present_count' => $event->participants()->where('is_present', true)->count(),
            ]
        ]);
    }

    /**
     * Mark attendance for a participant
     *
     * @urlParam event_id int required The ID of the event
     * @urlParam participant_id int required The ID of the participant
     * 
     * @response 200 {
     *   "message": "Attendance marked successfully",
     *   "data": {"is_present": true, "attended_at": "2025-08-13 10:00:00"}
     * }
     */
    public function markAttendance(Event $event, $participant_id): JsonResponse
    {
        $participant = $event->participants()->findOrFail($participant_id);
        
        if ($participant->is_present) {
            return response()->json([
                'message' => 'Attendance already marked',
                'data' => [
                    'is_present' => true,
                    'attended_at' => $participant->attended_at
                ]
            ], 200);
        }

        $participant->update([
            'is_present' => true,
            'attended_at' => now(),
        ]);

        return response()->json([
            'message' => 'Attendance marked successfully',
            'data' => [
                'is_present' => true,
                'attended_at' => $participant->attended_at
            ]
        ]);
    }

    /**
     * Get user's attendance token for an event
     */
    public function getAttendanceToken($eventId): JsonResponse
    {
        try {
            $user = Auth::user();
            
            $eventParticipant = EventParticipant::where('event_id', $eventId)
                ->where('participant_id', $user->id)
                ->first();

            if (!$eventParticipant) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Anda belum terdaftar untuk event ini'
                ], 404);
            }

            // Generate token if not exists
            if (!$eventParticipant->attendance_token) {
                $eventParticipant->generateAttendanceToken();
            }

            return response()->json([
                'status' => 'success',
                'data' => [
                    'attendance_token' => $eventParticipant->attendance_token,
                    'token_generated_at' => $eventParticipant->token_generated_at,
                    'token_expires_at' => $eventParticipant->token_expires_at,
                    'can_attend' => $eventParticipant->canAttend(),
                    'is_attendance_verified' => $eventParticipant->is_attendance_verified,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting attendance token: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mendapatkan token kehadiran'
            ], 500);
        }
    }

    /**
     * Verify attendance using token
     */
    public function verifyAttendance(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'event_id' => 'required|exists:events,id',
                'token' => 'required|string|size:10',
            ]);

            $user = Auth::user();
            $eventId = $request->event_id;
            $token = $request->token;

            $eventParticipant = EventParticipant::where('event_id', $eventId)
                ->where('participant_id', $user->id)
                ->first();

            if (!$eventParticipant) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Anda belum terdaftar untuk event ini'
                ], 404);
            }

            // Check if user can attend (event day and after start time)
            if (!$eventParticipant->canAttend()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Belum saatnya untuk daftar hadir. Daftar hadir hanya bisa dilakukan pada hari H setelah jam kegiatan dimulai.'
                ], 400);
            }

            // Check if already verified
            if ($eventParticipant->is_attendance_verified) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Anda sudah melakukan daftar hadir'
                ], 400);
            }

            // Verify token
            if ($eventParticipant->verifyAttendance($token)) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Daftar hadir berhasil!',
                    'data' => [
                        'attendance_verified_at' => $eventParticipant->attendance_verified_at,
                        'attendance_status' => $eventParticipant->attendance_status,
                    ]
                ]);
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Token tidak valid atau sudah expired'
                ], 400);
            }

        } catch (\Exception $e) {
            Log::error('Error verifying attendance: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal melakukan daftar hadir'
            ], 500);
        }
    }

    /**
     * Get attendance status for user's events
     */
    public function getAttendanceStatus(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            $eventParticipants = EventParticipant::with(['event'])
                ->where('participant_id', $user->id)
                ->get()
                ->filter(function ($participant) {
                    // Only include participants with valid events
                    return $participant->event !== null;
                })
                ->map(function ($participant) {
                    return [
                        'event_id' => $participant->event_id,
                        'event_title' => $participant->event->title,
                        'event_date' => $participant->event->date,
                        'event_start_time' => $participant->event->start_time,
                        'attendance_token' => $participant->attendance_token,
                        'attendance_status' => $participant->attendance_status,
                        'is_attendance_verified' => $participant->is_attendance_verified,
                        'attendance_verified_at' => $participant->attendance_verified_at,
                        'can_attend' => $participant->canAttend(),
                        'token_expires_at' => $participant->token_expires_at,
                    ];
                });

            return response()->json([
                'status' => 'success',
                'data' => $eventParticipants
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting attendance status: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mendapatkan status kehadiran'
            ], 500);
        }
    }
}
