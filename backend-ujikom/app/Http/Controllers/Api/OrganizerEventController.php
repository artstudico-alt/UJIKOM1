<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Http\Resources\EventResource;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class OrganizerEventController extends Controller
{
    /**
     * Display a listing of organizer events
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Event::where('organizer_type', 'organizer')
                ->where('user_id', Auth::id())
                ->withCount('eventParticipants as current_participants');

            // Filter by status
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            // Search functionality
            if ($request->has('search') && !empty($request->search)) {
                $query->where(function($q) use ($request) {
                    $q->where('title', 'like', '%' . $request->search . '%')
                      ->orWhere('description', 'like', '%' . $request->search . '%')
                      ->orWhere('location', 'like', '%' . $request->search . '%');
                });
            }

            $events = $query->orderBy('created_at', 'desc')
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
                'message' => 'Failed to fetch events: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created event
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'date' => 'required|date|after_or_equal:' . Carbon::now()->addDays(3)->toDateString(),
                'start_time' => 'required|date_format:H:i',
                'end_time' => 'required|date_format:H:i|after:start_time',
                'location' => 'required|string|max:255',
                'max_participants' => 'nullable|integer|min:1',
                'registration_deadline' => 'required|date|before:date',
                'organizer_name' => 'required|string|max:255',
                'organizer_email' => 'required|email',
                'organizer_contact' => 'nullable|string|max:20',
                'category' => 'required|string|max:100',
                'price' => 'nullable|numeric|min:0',
                'registration_date' => 'required|date|before:date',
                'flyer' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'image_url' => 'nullable|url'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $eventData = $request->all();
            $eventData['user_id'] = Auth::id();
            $eventData['organizer_type'] = 'organizer';
            $eventData['status'] = 'pending_approval';
            $eventData['submitted_at'] = now();
            $eventData['is_active'] = false; // Will be activated after approval

            // Handle file upload
            if ($request->hasFile('flyer')) {
                $file = $request->file('flyer');
                $filename = time() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('event_flyers', $filename, 'public');
                $eventData['flyer_path'] = $path;
            } elseif ($request->has('image_url') && !empty($request->image_url)) {
                // For URL-based images, we'll store the URL in a custom field
                // This will be handled in the EventResource
                $eventData['image_url'] = $request->image_url;
            }

            $event = Event::create($eventData);

            // Send notification to admins about pending event
            try {
                $notificationService = new NotificationService();
                $notificationService->sendEventPendingApprovalNotification($event);
            } catch (\Exception $e) {
                // Log error but don't fail the event creation
                \Log::error('Failed to send admin notification for pending event', [
                    'event_id' => $event->id,
                    'error' => $e->getMessage()
                ]);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Event submitted successfully and is pending approval',
                'data' => new EventResource($event)
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create event: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified event
     */
    public function show(Event $event): JsonResponse
    {
        try {
            // Check if user owns this event
            if ($event->user_id !== Auth::id() || $event->organizer_type !== 'organizer') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized access to this event'
                ], 403);
            }

            return response()->json([
                'status' => 'success',
                'data' => new EventResource($event)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch event: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified event
     */
    public function update(Request $request, Event $event): JsonResponse
    {
        try {
            // Check if user owns this event
            if ($event->user_id !== Auth::id() || $event->organizer_type !== 'organizer') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized access to this event'
                ], 403);
            }

            // Check if event can be updated (only draft and rejected events)
            if (!in_array($event->status, ['draft', 'rejected'])) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Event cannot be updated in current status: ' . $event->status
                ], 400);
            }

            $validator = Validator::make($request->all(), [
                'title' => 'sometimes|required|string|max:255',
                'description' => 'sometimes|required|string',
                'date' => 'sometimes|required|date|after_or_equal:' . Carbon::now()->addDays(3)->toDateString(),
                'start_time' => 'sometimes|required|date_format:H:i',
                'end_time' => 'sometimes|required|date_format:H:i|after:start_time',
                'location' => 'sometimes|required|string|max:255',
                'max_participants' => 'nullable|integer|min:1',
                'registration_deadline' => 'sometimes|required|date|before:date',
                'organizer_name' => 'sometimes|required|string|max:255',
                'organizer_email' => 'sometimes|required|email',
                'organizer_contact' => 'nullable|string|max:20',
                'category' => 'sometimes|required|string|max:100',
                'price' => 'nullable|numeric|min:0',
                'registration_date' => 'sometimes|required|date|before:date',
                'flyer' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'image_url' => 'nullable|url'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $eventData = $request->all();

            // Handle file upload
            if ($request->hasFile('flyer')) {
                // Delete old file if exists
                if ($event->flyer_path) {
                    Storage::disk('public')->delete($event->flyer_path);
                }

                $file = $request->file('flyer');
                $filename = time() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('event_flyers', $filename, 'public');
                $eventData['flyer_path'] = $path;
            } elseif ($request->has('image_url') && !empty($request->image_url)) {
                $eventData['image_url'] = $request->image_url;
            }

            // Reset status to pending if it was rejected
            if ($event->status === 'rejected') {
                $eventData['status'] = 'pending_approval';
                $eventData['submitted_at'] = now();
                $eventData['rejected_at'] = null;
                $eventData['rejection_reason'] = null;
            }

            $event->update($eventData);

            return response()->json([
                'status' => 'success',
                'message' => 'Event updated successfully',
                'data' => new EventResource($event)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update event: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified event
     */
    public function destroy(Event $event): JsonResponse
    {
        try {
            // Check if user owns this event
            if ($event->user_id !== Auth::id() || $event->organizer_type !== 'organizer') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized access to this event'
                ], 403);
            }

            // Check if event can be deleted (not published or ongoing)
            if (in_array($event->status, ['published', 'approved']) && $event->date >= now()->toDateString()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Cannot delete published or approved upcoming events'
                ], 400);
            }

            // Delete associated file
            if ($event->flyer_path) {
                Storage::disk('public')->delete($event->flyer_path);
            }

            $event->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Event deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete event: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get event statistics for organizer dashboard
     */
    public function statistics(): JsonResponse
    {
        try {
            $userId = Auth::id();

            $stats = [
                'total_events' => Event::where('user_id', $userId)->where('organizer_type', 'organizer')->count(),
                'pending_events' => Event::where('user_id', $userId)->where('organizer_type', 'organizer')->where('status', 'pending_approval')->count(),
                'approved_events' => Event::where('user_id', $userId)->where('organizer_type', 'organizer')->where('status', 'approved')->count(),
                'published_events' => Event::where('user_id', $userId)->where('organizer_type', 'organizer')->where('status', 'published')->count(),
                'rejected_events' => Event::where('user_id', $userId)->where('organizer_type', 'organizer')->where('status', 'rejected')->count(),
                'total_participants' => Event::where('user_id', $userId)->where('organizer_type', 'organizer')->withCount('eventParticipants')->get()->sum('event_participants_count')
            ];

            return response()->json([
                'status' => 'success',
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch statistics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get participants for a specific event
     */
    public function getParticipants($eventId): JsonResponse
    {
        try {
            $event = Event::findOrFail($eventId);

            // Check if user owns this event
            if ($event->user_id !== Auth::id() || $event->organizer_type !== 'organizer') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized access to this event'
                ], 403);
            }

            $participants = EventParticipant::where('event_id', $eventId)
                ->with('participant:id,name,email,phone')
                ->get()
                ->map(function ($participant) {
                    return [
                        'id' => $participant->id,
                        'user_id' => $participant->participant_id,
                        'name' => $participant->participant->name ?? 'N/A',
                        'email' => $participant->participant->email ?? 'N/A',
                        'phone' => $participant->participant->phone ?? 'N/A',
                        'registration_number' => $participant->registration_number,
                        'registration_date' => $participant->created_at->format('Y-m-d H:i:s'),
                        'attendance_status' => $participant->attendance_status ?? 'pending',
                        'is_attendance_verified' => $participant->is_attendance_verified,
                        'has_certificate' => $participant->has_received_certificate
                    ];
                });

            return response()->json([
                'status' => 'success',
                'data' => $participants
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch participants: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export participants to Excel (only names)
     */
    public function exportParticipants($eventId)
    {
        try {
            $event = Event::findOrFail($eventId);

            // Check if user owns this event
            if ($event->user_id !== Auth::id() || $event->organizer_type !== 'organizer') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized access to this event'
                ], 403);
            }

            $participants = EventParticipant::where('event_id', $eventId)
                ->with('participant:id,name')
                ->get();

            // Create new Spreadsheet
            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();

            // Set header
            $sheet->setCellValue('A1', 'No');
            $sheet->setCellValue('B1', 'Nama Lengkap');

            // Style header
            $sheet->getStyle('A1:B1')->getFont()->setBold(true);
            $sheet->getStyle('A1:B1')->getFill()
                ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                ->getStartColor()->setARGB('FFE0E0E0');

            // Add data
            $row = 2;
            foreach ($participants as $index => $participant) {
                $sheet->setCellValue('A' . $row, $index + 1);
                $sheet->setCellValue('B' . $row, $participant->participant->name ?? 'N/A');
                $row++;
            }

            // Auto-size columns
            $sheet->getColumnDimension('A')->setAutoSize(true);
            $sheet->getColumnDimension('B')->setAutoSize(true);

            // Generate filename
            $filename = 'participants_' . str_replace(' ', '_', $event->title) . '_' . date('Y-m-d') . '.xlsx';

            // Create writer and save to temp file
            $writer = new Xlsx($spreadsheet);
            $temp_file = tempnam(sys_get_temp_dir(), 'participants_');
            $writer->save($temp_file);

            // Return file download
            return response()->download($temp_file, $filename)->deleteFileAfterSend(true);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to export participants: ' . $e->getMessage()
            ], 500);
        }
    }
}
