<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Http\Resources\EventResource;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class AdminEventApprovalController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }
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
     * Get single event by ID for editing
     */
    public function getEventById($eventId): JsonResponse
    {
        try {
            $event = Event::with(['creator', 'eventParticipants'])
                ->withCount('eventParticipants as current_participants')
                ->findOrFail($eventId);

            return response()->json([
                'status' => 'success',
                'data' => new EventResource($event)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Event tidak ditemukan: ' . $e->getMessage()
            ], 404);
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

            $perPage = $request->get('per_page', 10);
            $events = $query->orderBy('submitted_at', 'desc')
                           ->paginate($perPage);

            // Transform events collection to array
            $eventsData = $events->getCollection()->map(function($event) {
                return new EventResource($event);
            });

            return response()->json([
                'status' => 'success',
                'data' => $eventsData,
                'pagination' => [
                    'current_page' => $events->currentPage(),
                    'last_page' => $events->lastPage(),
                    'per_page' => $events->perPage(),
                    'total' => $events->total(),
                ],
                'meta' => [
                    'total_pending' => $events->total(),
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Get pending events error: ' . $e->getMessage());
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
            \Log::info('Approving event', [
                'event_id' => $event->id,
                'title' => $event->title,
                'current_status' => $event->status,
                'organizer_type' => $event->organizer_type,
                'is_active' => $event->is_active
            ]);

            // Check if event is organizer event and pending
            if ($event->organizer_type !== 'organizer' || $event->status !== 'pending_approval') {
                \Log::warning('Event cannot be approved', [
                    'event_id' => $event->id,
                    'organizer_type' => $event->organizer_type,
                    'status' => $event->status
                ]);
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

            // Refresh to get updated values
            $event->refresh();

            \Log::info('Event approved successfully', [
                'event_id' => $event->id,
                'new_status' => $event->status,
                'is_active' => $event->is_active,
                'approved_at' => $event->approved_at
            ]);

            // Send notification to all public users about new event
            $this->notificationService->sendNewEventNotification($event);

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

            // Check if event can be rejected
            // Allow rejection for: pending_approval, approved, published
            $rejectableStatuses = ['pending_approval', 'approved', 'published'];

            if (!in_array($event->status, $rejectableStatuses)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Event dengan status "' . $event->status . '" tidak dapat ditolak. Hanya event dengan status pending, approved, atau published yang dapat ditolak.'
                ], 400);
            }

            // Check if event is already rejected
            if ($event->status === 'rejected') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Event sudah ditolak sebelumnya'
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

            // Log the rejection
            \Log::info('Event rejected by admin', [
                'event_id' => $event->id,
                'event_title' => $event->title,
                'admin_id' => Auth::id(),
                'reason' => $request->rejection_reason,
                'previous_status' => $event->getOriginal('status')
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Event berhasil ditolak',
                'data' => new EventResource($event)
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Alasan penolakan harus diisi',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Failed to reject event', [
                'event_id' => $event->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menolak event: ' . $e->getMessage()
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

    /**
     * Create new event (Admin)
     */
    public function createEvent(Request $request): JsonResponse
    {
        try {
            \Log::info('Admin creating event', ['data' => $request->all()]);

            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'date' => 'required|date',
                'start_time' => 'required',
                'end_time' => 'required',
                'location' => 'required|string',
                'max_participants' => 'required|integer|min:1',
                'registration_deadline' => 'required|date',
                'registration_date' => 'nullable|date',
                'price' => 'nullable|numeric|min:0',
                'organizer_name' => 'required|string|max:255',
                'organizer_email' => 'required|email',
                'organizer_contact' => 'required|string',
                'event_type' => 'required|string',
                'category' => 'required|string',
                'flyer' => 'nullable|image|max:2048',
            ]);

            // Handle file upload
            $imagePath = null;
            if ($request->hasFile('flyer')) {
                $imagePath = $request->file('flyer')->store('events', 'public');
            }

            // Create event
            $event = Event::create([
                'title' => $validated['title'],
                'description' => $validated['description'],
                'date' => $validated['date'],
                'start_time' => $validated['start_time'],
                'end_time' => $validated['end_time'],
                'location' => $validated['location'],
                'max_participants' => $validated['max_participants'],
                'registration_deadline' => $validated['registration_deadline'],
                'registration_date' => $validated['registration_date'] ?? $validated['registration_deadline'],
                'price' => $validated['price'] ?? 0,
                'organizer_name' => $validated['organizer_name'],
                'organizer_email' => $validated['organizer_email'],
                'organizer_contact' => $validated['organizer_contact'],
                'event_type' => $validated['event_type'],
                'category' => $validated['category'],
                'image' => $imagePath,
                'image_url' => $imagePath ? asset('storage/' . $imagePath) : null,
                'status' => 'published', // Admin events are published immediately
                'is_active' => true,
                'organizer_type' => 'admin',
                'created_by' => Auth::id(),
                'approved_by' => Auth::id(),
                'approved_at' => now(),
            ]);

            \Log::info('Admin event created successfully', ['event_id' => $event->id]);

            return response()->json([
                'status' => 'success',
                'message' => 'Event berhasil dibuat dan langsung dipublikasikan',
                'data' => new EventResource($event)
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation failed for admin event creation', ['errors' => $e->errors()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Failed to create admin event', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal membuat event: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update event (Admin)
     */
    public function updateEvent(Request $request, Event $event): JsonResponse
    {
        try {
            \Log::info('Admin updating event', ['event_id' => $event->id, 'data' => $request->all()]);

            $validated = $request->validate([
                'title' => 'sometimes|required|string|max:255',
                'description' => 'sometimes|required|string',
                'date' => 'sometimes|required|date',
                'start_time' => 'sometimes|required',
                'end_time' => 'sometimes|required',
                'location' => 'sometimes|required|string',
                'max_participants' => 'sometimes|required|integer|min:1',
                'registration_deadline' => 'sometimes|required|date',
                'price' => 'nullable|numeric|min:0',
                'organizer_name' => 'sometimes|required|string|max:255',
                'organizer_email' => 'sometimes|required|email',
                'organizer_contact' => 'sometimes|required|string',
                'event_type' => 'sometimes|required|string',
                'category' => 'sometimes|required|string',
                'flyer' => 'nullable|image|max:2048',
            ]);

            // Handle file upload
            if ($request->hasFile('flyer')) {
                // Delete old image if exists
                if ($event->image) {
                    \Storage::disk('public')->delete($event->image);
                }
                $imagePath = $request->file('flyer')->store('events', 'public');
                $validated['image'] = $imagePath;
                $validated['image_url'] = asset('storage/' . $imagePath);
            }

            $event->update($validated);

            \Log::info('Admin event updated successfully', ['event_id' => $event->id]);

            return response()->json([
                'status' => 'success',
                'message' => 'Event berhasil diupdate',
                'data' => new EventResource($event)
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to update admin event', [
                'event_id' => $event->id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengupdate event: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete event (Admin)
     */
    public function deleteEvent(Event $event): JsonResponse
    {
        try {
            \Log::info('Admin deleting event', ['event_id' => $event->id]);

            // Delete image if exists
            if ($event->image) {
                \Storage::disk('public')->delete($event->image);
            }

            $event->delete();

            \Log::info('Admin event deleted successfully', ['event_id' => $event->id]);

            return response()->json([
                'status' => 'success',
                'message' => 'Event berhasil dihapus'
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to delete admin event', [
                'event_id' => $event->id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menghapus event: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get dashboard statistics
     */
    public function getDashboardStats(): JsonResponse
    {
        try {
            $totalUsers = \App\Models\User::count();
            $totalEvents = Event::count();
            $totalOrganizerEvents = Event::where('organizer_type', 'organizer')->count();
            $totalAdminEvents = Event::where('organizer_type', 'admin')->count();
            $pendingApprovals = Event::where('status', 'pending_approval')->count();
            $publishedEvents = Event::whereIn('status', ['published', 'approved'])->count();
            $activeEvents = Event::where('is_active', true)->count();
            $completedEvents = Event::where('status', 'completed')->count();

            // Total participants across all events
            $totalParticipants = \DB::table('event_participant')->count();

            // New users this month
            $newUsersThisMonth = \App\Models\User::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count();

            // New events this month
            $newEventsThisMonth = Event::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count();

            // Revenue this month (sum of paid events - ONLY published/approved events)
            $revenueThisMonth = Event::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->whereIn('status', ['published', 'approved']) // Only count published events
                ->sum('price');

            return response()->json([
                'status' => 'success',
                'data' => [
                    'total_users' => $totalUsers,
                    'total_events' => $totalEvents,
                    'total_organizer_events' => $totalOrganizerEvents,
                    'total_admin_events' => $totalAdminEvents,
                    'pending_approvals' => $pendingApprovals,
                    'published_events' => $publishedEvents,
                    'active_events' => $activeEvents,
                    'completed_events' => $completedEvents,
                    'total_participants' => $totalParticipants,
                    'new_users_this_month' => $newUsersThisMonth,
                    'new_events_this_month' => $newEventsThisMonth,
                    'revenue_this_month' => $revenueThisMonth,
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to get dashboard stats', [
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memuat statistik dashboard: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get chart data for dashboard
     */
    public function getChartData(): JsonResponse
    {
        try {
            // Events per month (last 6 months)
            $eventsPerMonth = [];
            for ($i = 5; $i >= 0; $i--) {
                $month = now()->copy()->subMonths($i);
                $count = Event::whereMonth('created_at', $month->month)
                    ->whereYear('created_at', $month->year)
                    ->count();
                $eventsPerMonth[] = [
                    'month' => $month->format('M Y'),
                    'count' => $count
                ];
            }

            // Participants per month (last 6 months)
            $participantsPerMonth = [];
            for ($i = 5; $i >= 0; $i--) {
                $month = now()->copy()->subMonths($i);
                $count = \DB::table('event_participant')
                    ->whereMonth('created_at', $month->month)
                    ->whereYear('created_at', $month->year)
                    ->count();
                $participantsPerMonth[] = [
                    'month' => $month->format('M Y'),
                    'count' => $count
                ];
            }

            // Top events by participants - handle if no events exist
            $topEventsQuery = Event::withCount('eventParticipants')
                ->orderBy('event_participants_count', 'desc')
                ->limit(5)
                ->get();

            $topEvents = $topEventsQuery->map(function ($event) {
                return [
                    'name' => $event->title ?? 'Untitled Event',
                    'participants' => $event->event_participants_count ?? 0
                ];
            })->toArray();

            \Log::info('Chart data generated successfully', [
                'eventsPerMonth' => count($eventsPerMonth),
                'participantsPerMonth' => count($participantsPerMonth),
                'topEvents' => count($topEvents)
            ]);

            return response()->json([
                'eventsPerMonth' => $eventsPerMonth,
                'participantsPerMonth' => $participantsPerMonth,
                'topEvents' => $topEvents
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to get chart data', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Return empty data instead of error to prevent dashboard crash
            return response()->json([
                'eventsPerMonth' => [],
                'participantsPerMonth' => [],
                'topEvents' => []
            ]);
        }
    }
}
