<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Http\Resources\EventResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class AdminEventApprovalController extends Controller
{
    /**
     * Get all events for admin dashboard
     */
    public function getAllEvents(Request $request): JsonResponse
    {
        try {
            $query = Event::with(['creator', 'eventParticipants'])
                ->withCount('eventParticipants as current_participants');

            // Filter by status if provided
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            // Search functionality
            if ($request->has('search') && !empty($request->search)) {
                $query->where(function($q) use ($request) {
                    $q->where('title', 'like', '%' . $request->search . '%')
                      ->orWhere('description', 'like', '%' . $request->search . '%')
                      ->orWhere('organizer_name', 'like', '%' . $request->search . '%');
                });
            }

            $events = $query->orderBy('created_at', 'desc')
                           ->paginate($request->get('per_page', 15));

            return response()->json([
                'status' => 'success',
                'data' => EventResource::collection($events),
                'pagination' => [
                    'current_page' => $events->currentPage(),
                    'last_page' => $events->lastPage(),
                    'per_page' => $events->perPage(),
                    'total' => $events->total(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch events: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get recent events for admin dashboard
     */
    public function getRecentEvents(Request $request): JsonResponse
    {
        try {
            $limit = $request->get('limit', 5);

            $events = Event::where('status', 'published')
                ->with(['creator', 'eventParticipants'])
                ->withCount('eventParticipants as current_participants')
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => EventResource::collection($events)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch recent events: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get pending events for approval
     */
    public function getPendingEvents(Request $request): JsonResponse
    {
        try {
            $query = Event::where('organizer_type', 'organizer')
                ->where('status', 'pending_approval')
                ->with(['creator', 'eventParticipants'])
                ->withCount('eventParticipants as current_participants');

            // Search functionality
            if ($request->has('search') && !empty($request->search)) {
                $query->where(function($q) use ($request) {
                    $q->where('title', 'like', '%' . $request->search . '%')
                      ->orWhere('description', 'like', '%' . $request->search . '%')
                      ->orWhere('organizer_name', 'like', '%' . $request->search . '%');
                });
            }

            $events = $query->orderBy('submitted_at', 'desc')
                           ->paginate($request->get('per_page', 10));

            return response()->json([
                'status' => 'success',
                'data' => EventResource::collection($events),
                'pagination' => [
                    'current_page' => $events->currentPage(),
                    'last_page' => $events->lastPage(),
                    'per_page' => $events->perPage(),
                    'total' => $events->total(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch pending events: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Approve event
     */
    public function approveEvent(Request $request, Event $event): JsonResponse
    {
        try {
            // Check if event is organizer event and pending
            if ($event->organizer_type !== 'organizer' || $event->status !== 'pending_approval') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Event cannot be approved in current status'
                ], 400);
            }

            // Approve and activate the event
            $event->update([
                'status' => 'published',
                'is_active' => true,
                'approved_at' => now(),
                'approved_by' => Auth::id(),
                'rejected_at' => null,
                'rejection_reason' => null,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Event approved and published successfully',
                'data' => new EventResource($event)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to approve event: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject event
     */
    public function rejectEvent(Request $request, Event $event): JsonResponse
    {
        try {
            // Validate rejection reason
            $request->validate([
                'rejection_reason' => 'required|string|max:500'
            ]);

            // Check if event is organizer event and pending
            if ($event->organizer_type !== 'organizer' || $event->status !== 'pending_approval') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Event cannot be rejected in current status'
                ], 400);
            }

            // Reject the event
            $event->update([
                'status' => 'rejected',
                'is_active' => false,
                'rejected_at' => now(),
                'approved_by' => Auth::id(),
                'rejection_reason' => $request->rejection_reason,
                'approved_at' => null,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Event rejected successfully',
                'data' => new EventResource($event)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to reject event: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get approval statistics
     */
    public function getApprovalStats(): JsonResponse
    {
        try {
            $stats = [
                'pending_events' => Event::where('organizer_type', 'organizer')->where('status', 'pending_approval')->count(),
                'approved_events' => Event::where('organizer_type', 'organizer')->where('status', 'published')->count(),
                'rejected_events' => Event::where('organizer_type', 'organizer')->where('status', 'rejected')->count(),
                'total_organizer_events' => Event::where('organizer_type', 'organizer')->count(),
            ];

            return response()->json([
                'status' => 'success',
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch approval statistics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk approve events
     */
    public function bulkApprove(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'event_ids' => 'required|array',
                'event_ids.*' => 'integer|exists:events,id'
            ]);

            $events = Event::whereIn('id', $request->event_ids)
                ->where('organizer_type', 'organizer')
                ->where('status', 'pending_approval')
                ->get();

            $approvedCount = 0;
            foreach ($events as $event) {
                $event->update([
                    'status' => 'published',
                    'is_active' => true,
                    'approved_at' => now(),
                    'approved_by' => Auth::id(),
                    'rejected_at' => null,
                    'rejection_reason' => null,
                ]);
                $approvedCount++;
            }

            return response()->json([
                'status' => 'success',
                'message' => "Successfully approved {$approvedCount} events",
                'approved_count' => $approvedCount
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to bulk approve events: ' . $e->getMessage()
            ], 500);
        }
    }
}
