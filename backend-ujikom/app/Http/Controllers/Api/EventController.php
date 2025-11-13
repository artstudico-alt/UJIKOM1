<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\Attendance;
use App\Models\Certificate;
use App\Http\Resources\EventResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\EventParticipantsExport;
use App\Exports\DashboardExport;
use App\Services\NotificationService;

class EventController extends Controller
{
    /**
     * Display a listing of events (public)
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Event::with(['creator', 'eventParticipants'])
                ->where(function($q) {
                    $q->where('is_active', true)
                      ->orWhere(function($subQ) {
                          $subQ->where('organizer_type', 'organizer')
                               ->where('status', 'published');
                      });
                })
                ->withCount('eventParticipants as current_participants');

            // Search functionality
            if ($request->has('search') && !empty($request->search)) {
                $query->where(function($q) use ($request) {
                    $q->where('title', 'like', '%' . $request->search . '%')
                      ->orWhere('description', 'like', '%' . $request->search . '%')
                      ->orWhere('location', 'like', '%' . $request->search . '%');
                });
            }

            // Filter by status
            if ($request->has('status') && $request->status !== 'all') {
                switch ($request->status) {
                    case 'upcoming':
                        $query->where('date', '>', now()->toDateString());
                        break;
                    case 'ongoing':
                        $query->where('date', '=', now()->toDateString());
                        break;
                    case 'completed':
                        $query->where('date', '<', now()->toDateString());
                        break;
                }
            }

            // Sorting functionality
            if ($request->has('sort')) {
                switch ($request->sort) {
                    case 'date_asc':
                        $query->orderBy('date', 'asc')->orderBy('start_time', 'asc');
                        break;
                    case 'date_desc':
                        $query->orderBy('date', 'desc')->orderBy('start_time', 'desc');
                        break;
                    case 'title_asc':
                        $query->orderBy('title', 'asc');
                        break;
                    case 'title_desc':
                        $query->orderBy('title', 'desc');
                        break;
                    case 'participants_desc':
                        $query->orderBy('current_participants', 'desc');
                        break;
                    case 'participants_asc':
                        $query->orderBy('current_participants', 'asc');
                        break;
                    default:
                        // Default: closest upcoming first
                        $query->orderBy('date', 'asc')->orderBy('start_time', 'asc');
                        break;
                }
            } else {
                // Default: closest upcoming first
                $query->orderBy('date', 'asc')->orderBy('start_time', 'asc');
            }

            $events = $query->paginate($request->get('per_page', 12));

            return response()->json([
                'status' => 'success',
                'data' => EventResource::collection($events),
                'pagination' => [
                    'current_page' => $events->currentPage(),
                    'last_page' => $events->lastPage(),
                    'per_page' => $events->perPage(),
                    'total' => $events->total(),
                ]
            ])->header('Cache-Control', 'no-cache, no-store, must-revalidate')
              ->header('Pragma', 'no-cache')
              ->header('Expires', '0');

        } catch (\Exception $e) {
            Log::error('Error fetching events: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch events',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Display the specified event (public)
     */
    public function show($id): JsonResponse
    {
        try {
            $event = Event::with(['creator', 'eventParticipants.participant'])
                ->withCount('eventParticipants as current_participants')
                ->findOrFail($id);

            return response()->json([
                'status' => 'success',
                'data' => new EventResource($event)
            ])->header('Cache-Control', 'no-cache, no-store, must-revalidate')
              ->header('Pragma', 'no-cache')
              ->header('Expires', '0');

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Event not found'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Error fetching event: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch event',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Store a newly created event (admin only)
     */
    public function store(Request $request): JsonResponse
    {
        try {
            // Clean up flyer field if it's an empty array (frontend bug)
            if ($request->has('flyer') && is_array($request->input('flyer')) && empty($request->input('flyer'))) {
                $request->request->remove('flyer');
            }

            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'date' => 'required|date|after_or_equal:today',
                'start_time' => 'required|date_format:H:i',
                'end_time' => 'required|date_format:H:i|after:start_time',
                'location' => 'required|string|max:255',
                'max_participants' => 'nullable|integer|min:1',
                'registration_deadline' => 'required|date|before_or_equal:date',
                'flyer' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
                'certificate_template' => 'nullable|file|mimes:pdf,jpeg,png,jpg|max:5120',
                // Payment fields
                'is_paid_event' => 'nullable|boolean',
                'ticket_price' => 'nullable|numeric|min:0',
                'currency' => 'nullable|string|in:IDR,USD',
                'available_payment_methods' => 'nullable|string',
                'early_bird_enabled' => 'nullable|boolean',
                'early_bird_discount' => 'nullable|numeric|min:0|max:100',
                'early_bird_deadline' => 'nullable|date',
                'max_tickets_per_user' => 'nullable|integer|min:1',
                'requires_approval' => 'nullable|boolean',
                'payment_instructions' => 'nullable|string',
                'payment_expiry_hours' => 'nullable|integer|min:1|max:168',
                'auto_approve_payments' => 'nullable|boolean',
                'allows_refund' => 'nullable|boolean',
                'refund_deadline_hours' => 'nullable|integer|min:1',
                'refund_policy' => 'nullable|string',
            ]);

            // Check if event is being created at least 3 days before the event
            $eventDate = Carbon::parse($validated['date']);
            if (now()->diffInDays($eventDate) < 3) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Event harus dibuat minimal H-3 dari tanggal pelaksanaan.'
                ], 422);
            }

            DB::beginTransaction();

            $eventData = [
                'user_id' => auth()->id(),
                'title' => $validated['title'],
                'description' => $validated['description'],
                'date' => $validated['date'],
                'start_time' => $validated['start_time'],
                'end_time' => $validated['end_time'],
                'location' => $validated['location'],
                'max_participants' => $validated['max_participants'] ?? null,
                'registration_deadline' => $validated['registration_deadline'],
                'is_active' => true,
                // Payment fields
                'is_paid_event' => $validated['is_paid_event'] ?? false,
                'ticket_price' => $validated['ticket_price'] ?? 0.00,
                'currency' => $validated['currency'] ?? 'IDR',
                'available_payment_methods' => $validated['available_payment_methods'] ?? ['virtual_account', 'ewallet', 'credit_card', 'qris'],
                'early_bird_enabled' => $validated['early_bird_enabled'] ?? false,
                'early_bird_discount' => $validated['early_bird_discount'] ?? 0.00,
                'early_bird_deadline' => $validated['early_bird_deadline'] ?? null,
                'max_tickets_per_user' => $validated['max_tickets_per_user'] ?? 1,
                'requires_approval' => $validated['requires_approval'] ?? false,
                'payment_instructions' => $validated['payment_instructions'] ?? null,
                'payment_expiry_hours' => $validated['payment_expiry_hours'] ?? 24,
                'auto_approve_payments' => $validated['auto_approve_payments'] ?? true,
                'allows_refund' => $validated['allows_refund'] ?? false,
                'refund_deadline_hours' => $validated['refund_deadline_hours'] ?? null,
                'refund_policy' => $validated['refund_policy'] ?? null,
                // Certificate fields
                'has_certificate' => false,
                'certificate_required' => false,
            ];

            // Handle file uploads
            if ($request->hasFile('flyer')) {
                $path = $request->file('flyer')->store('events/flyers', 'public');
                $eventData['flyer_path'] = $path;
            }

            if ($request->hasFile('certificate_template')) {
                $path = $request->file('certificate_template')->store('events/certificates/templates', 'public');
                $eventData['certificate_template_path'] = $path;
            }

            $event = Event::create($eventData);

            DB::commit();

            // Send new event notification
            try {
                $notificationService = app(NotificationService::class);
                $notificationService->sendNewEventNotification($event);
            } catch (\Exception $e) {
                Log::warning('Failed to send new event notification', [
                    'event_id' => $event->id,
                    'error' => $e->getMessage()
                ]);
            }

            Log::info('Event created successfully', [
                'event_id' => $event->id,
                'title' => $event->title,
                'created_by' => auth()->id()
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Event berhasil dibuat',
                'data' => new EventResource($event)
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data tidak valid',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating event: ' . $e->getMessage());
            Log::error('Error trace: ' . $e->getTraceAsString());

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal membuat event',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ], 500);
        }
    }

    /**
     * Update the specified event (admin only)
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            DB::beginTransaction();

            $event = Event::findOrFail($id);

            // Debug: Log incoming request data
            Log::info('Event update request received:', [
                'event_id' => $id,
                'title' => $request->input('title'),
                'description' => $request->input('description'),
                'date' => $request->input('date'),
                'start_time' => $request->input('start_time'),
                'end_time' => $request->input('end_time'),
                'location' => $request->input('location'),
                'max_participants' => $request->input('max_participants'),
                'registration_deadline' => $request->input('registration_deadline'),
                'is_active' => $request->input('is_active'),
                // Payment fields
                'is_paid_event' => $request->input('is_paid_event'),
                'ticket_price' => $request->input('ticket_price'),
                'currency' => $request->input('currency'),
                'available_payment_methods' => $request->input('available_payment_methods'),
                'early_bird_enabled' => $request->input('early_bird_enabled'),
                'early_bird_discount' => $request->input('early_bird_discount'),
                'payment_expiry_hours' => $request->input('payment_expiry_hours'),
                'auto_approve_payments' => $request->input('auto_approve_payments'),
                'allows_refund' => $request->input('allows_refund'),
                'requires_approval' => $request->input('requires_approval'),
                'max_tickets_per_user' => $request->input('max_tickets_per_user'),
                'all_request_data' => $request->all(),
                'request_method' => $request->method(),
                'content_type' => $request->header('Content-Type'),
                'has_files' => $request->hasFile('flyer'),
                'all_files' => $request->allFiles(),
                'raw_content' => $request->getContent(),
                'php_input' => file_get_contents('php://input')
            ]);

        // Parse FormData manually if Laravel can't process it
        $allData = $request->all();

        // Check if we have files first
        $hasFiles = $request->hasFile('flyer');
        Log::info('File check before parsing:', [
            'hasFiles' => $hasFiles,
            'allData' => $allData,
            'hasContent' => !empty($request->getContent())
        ]);

        // If allData is empty but we have raw content, try to parse it manually
        if (empty($allData) && !empty($request->getContent())) {
                $rawContent = $request->getContent();
                Log::info('Parsing FormData manually from raw content');

                // Parse multipart/form-data manually
                $boundary = null;
                if (preg_match('/boundary=(.+)$/', $request->header('Content-Type'), $matches)) {
                    $boundary = $matches[1];
                }

                if ($boundary) {
                    $parts = explode('--' . $boundary, $rawContent);
                    foreach ($parts as $part) {
                        if (strpos($part, 'Content-Disposition: form-data') !== false) {
                            $lines = explode("\r\n", $part);
                            $name = null;
                            $value = '';
                            $isFile = false;
                            $filename = null;
                            $valueStartIndex = -1;

                            foreach ($lines as $index => $line) {
                                if (strpos($line, 'name="') !== false) {
                                    preg_match('/name="([^"]+)"/', $line, $nameMatches);
                                    if (isset($nameMatches[1])) {
                                        $name = $nameMatches[1];
                                    }
                                }
                                if (strpos($line, 'filename="') !== false) {
                                    $isFile = true;
                                    preg_match('/filename="([^"]+)"/', $line, $filenameMatches);
                                    if (isset($filenameMatches[1])) {
                                        $filename = $filenameMatches[1];
                                    }
                                }
                                if (trim($line) === '' && $name) {
                                    $valueStartIndex = $index + 1;
                                    break;
                                }
                            }

                            if ($valueStartIndex > 0 && $name) {
                                if ($isFile && $filename) {
                                    // Handle file upload
                                    $valueLines = array_slice($lines, $valueStartIndex);
                                    $fileContent = implode("\r\n", $valueLines);

                                    // Create a temporary file
                                    $tempFile = tempnam(sys_get_temp_dir(), 'upload_');
                                    file_put_contents($tempFile, $fileContent);

                                    // Create UploadedFile instance
                                    $uploadedFile = new \Illuminate\Http\UploadedFile(
                                        $tempFile,
                                        $filename,
                                        mime_content_type($tempFile),
                                        null,
                                        true
                                    );

                                    // Add to request files using the correct method
                                    $request->files->set($name, $uploadedFile);

                                    // Force refresh the request files
                                    $request->files->add([$name => $uploadedFile]);

                                    // Also add to request data for validation
                                    $request->merge([$name => $uploadedFile]);

                                    Log::info('File parsed and added to request:', [
                                        'name' => $name,
                                        'filename' => $filename,
                                        'size' => strlen($fileContent),
                                        'temp_file' => $tempFile,
                                        'uploaded_file_valid' => $uploadedFile->isValid(),
                                        'uploaded_file_size' => $uploadedFile->getSize()
                                    ]);
                                } else {
                                    // Handle regular form field
                                    $valueLines = array_slice($lines, $valueStartIndex);
                                    $value = trim(implode("\r\n", $valueLines));

                                    // Clean up the value (remove any remaining headers)
                                    $value = preg_replace('/^Content-Disposition:.*$/m', '', $value);
                                    $value = trim($value);

                                    if (!empty($value)) {
                                        $request->merge([$name => $value]);
                                    }
                                }
                            }
                        }
                    }
                }

                // Update allData after manual parsing
                $allData = $request->all();
            }

        // Check files after manual parsing
        $hasFilesAfterParsing = $request->hasFile('flyer');
        $allFiles = $request->allFiles();
        $flyerFile = $request->file('flyer');

        // Alternative check methods
        $hasFileAlternative = $request->files->has('flyer');
        $fileFromFiles = $request->files->get('flyer');

        Log::info('FormData check after parsing:', [
            'allData' => $allData,
            'hasFormData' => !empty($allData),
            'hasFile' => $hasFilesAfterParsing,
            'hasFileAlternative' => $hasFileAlternative,
            'allFiles' => $allFiles,
            'filesCount' => count($allFiles),
            'flyerFile' => $flyerFile ? [
                'name' => $flyerFile->getClientOriginalName(),
                'size' => $flyerFile->getSize(),
                'valid' => $flyerFile->isValid(),
                'mime' => $flyerFile->getMimeType()
            ] : null,
            'fileFromFiles' => $fileFromFiles ? [
                'name' => $fileFromFiles->getClientOriginalName(),
                'size' => $fileFromFiles->getSize(),
                'valid' => $fileFromFiles->isValid(),
                'mime' => $fileFromFiles->getMimeType()
            ] : null
        ]);

            // Clean up flyer field if it's an empty array (frontend bug)
            if ($request->has('flyer') && is_array($request->input('flyer')) && empty($request->input('flyer'))) {
                $request->request->remove('flyer');
            }

            // Custom validation rules based on event date
            $isEventInPast = $event->date < now()->toDateString();
            $dateValidation = $isEventInPast ? 'required|date' : 'required|date|after_or_equal:today';
            $registrationDeadlineValidation = $isEventInPast ? 'required|date' : 'required|date|before_or_equal:date';

            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'date' => $dateValidation,
                'start_time' => 'required|date_format:H:i',
                'end_time' => 'required|date_format:H:i|after:start_time',
                'location' => 'required|string|max:255',
                'max_participants' => 'nullable|integer|min:1',
                'registration_deadline' => $registrationDeadlineValidation,
                'is_active' => 'nullable|boolean',
                'flyer' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
                'certificate_template' => 'nullable|file|mimes:pdf,jpeg,png,jpg|max:5120',
                // Payment fields
                'is_paid_event' => 'nullable|boolean',
                'ticket_price' => 'nullable|numeric|min:0',
                'currency' => 'nullable|string|in:IDR,USD',
                'available_payment_methods' => 'nullable|string',
                'early_bird_enabled' => 'nullable|boolean',
                'early_bird_discount' => 'nullable|numeric|min:0|max:100',
                'early_bird_deadline' => 'nullable|date',
                'max_tickets_per_user' => 'nullable|integer|min:1',
                'requires_approval' => 'nullable|boolean',
                'payment_instructions' => 'nullable|string',
                'payment_expiry_hours' => 'nullable|integer|min:1|max:168',
                'auto_approve_payments' => 'nullable|boolean',
                'allows_refund' => 'nullable|boolean',
                'refund_deadline_hours' => 'nullable|integer|min:1',
                'refund_policy' => 'nullable|string',
            ]);

            // Handle file uploads
        Log::info('File upload debug', [
            'hasFile_flyer' => $request->hasFile('flyer'),
            'hasFile_flyer_alternative' => $request->files->has('flyer'),
            'file_flyer' => $request->file('flyer'),
            'file_flyer_from_files' => $request->files->get('flyer'),
            'all_files' => $request->allFiles(),
            'all_input' => $request->all()
        ]);

            // Try multiple methods to get the file
            $file = null;
            if ($request->hasFile('flyer')) {
                $file = $request->file('flyer');
            } elseif ($request->files->has('flyer')) {
                $file = $request->files->get('flyer');
            }

            if ($file) {
                Log::info('Flyer file details', [
                    'name' => $file->getClientOriginalName(),
                    'size' => $file->getSize(),
                    'mime' => $file->getMimeType(),
                    'is_valid' => $file->isValid()
                ]);

                // Validate file
                if (!$file->isValid()) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'File tidak valid'
                    ], 422);
                }

                // Delete old flyer if exists
                if ($event->flyer_path) {
                    $oldPath = storage_path('app/public/' . $event->flyer_path);
                    if (file_exists($oldPath)) {
                        unlink($oldPath);
                        Log::info('Old flyer deleted', ['path' => $event->flyer_path]);
                    }
                    Storage::disk('public')->delete($event->flyer_path);
                }

                // Store new file using the $file variable instead of $request->file('flyer')
                $path = $file->store('events/flyers', 'public');
                $validated['flyer_path'] = $path;

                // Ensure file is accessible via public storage
                $publicPath = storage_path('app/public/' . $path);
                $publicStoragePath = public_path('storage/' . $path);

                // Create directory if it doesn't exist
                $publicStorageDir = dirname($publicStoragePath);
                if (!file_exists($publicStorageDir)) {
                    mkdir($publicStorageDir, 0755, true);
                }

                // Copy file to public storage if it doesn't exist
                if (file_exists($publicPath) && !file_exists($publicStoragePath)) {
                    copy($publicPath, $publicStoragePath);
                }

                Log::info('New flyer uploaded', [
                    'path' => $path,
                    'public_path' => $publicPath,
                    'public_storage_path' => $publicStoragePath,
                    'file_exists_public' => file_exists($publicPath),
                    'file_exists_public_storage' => file_exists($publicStoragePath)
                ]);
            } else {
                Log::info('No flyer file provided, keeping existing flyer_path');
                // Don't modify flyer_path if no new file is uploaded
                unset($validated['flyer_path']);
            }

            if ($request->hasFile('certificate_template')) {
                // Delete old template if exists
                if ($event->certificate_template_path) {
                    Storage::disk('public')->delete($event->certificate_template_path);
                }
                $path = $request->file('certificate_template')->store('events/certificates/templates', 'public');
                $validated['certificate_template_path'] = $path;
            }

            // Handle is_active checkbox properly
            $validated['is_active'] = $request->has('is_active') ? (bool)$request->input('is_active') : false;

            // Handle payment fields properly
            $validated['is_paid_event'] = $request->has('is_paid_event') ? (bool)$request->input('is_paid_event') : false;
            $validated['early_bird_enabled'] = $request->has('early_bird_enabled') ? (bool)$request->input('early_bird_enabled') : false;
            $validated['auto_approve_payments'] = $request->has('auto_approve_payments') ? (bool)$request->input('auto_approve_payments') : true;
            $validated['allows_refund'] = $request->has('allows_refund') ? (bool)$request->input('allows_refund') : false;
            $validated['requires_approval'] = $request->has('requires_approval') ? (bool)$request->input('requires_approval') : false;

            // Handle available_payment_methods JSON
            if ($request->has('available_payment_methods')) {
                $paymentMethods = $request->input('available_payment_methods');
                if (is_string($paymentMethods)) {
                    $decoded = json_decode($paymentMethods, true);
                    if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                        $validated['available_payment_methods'] = $decoded;
                    } else {
                        // Fallback to default if JSON decode fails
                        $validated['available_payment_methods'] = ['virtual_account', 'ewallet', 'credit_card', 'qris'];
                    }
                } else {
                    $validated['available_payment_methods'] = $paymentMethods;
                }
            }

            // Debug: Log validated data before update
            Log::info('Validated data before update:', $validated);

            $event->update($validated);

            // Debug: Log event data after update but before refresh
            Log::info('Event data after update (before refresh):', [
                'id' => $event->id,
                'title' => $event->title,
                'description' => $event->description,
                'date' => $event->date,
                'start_time' => $event->start_time,
                'end_time' => $event->end_time
            ]);

            // Refresh the model to get updated data from database
            $event->refresh();

            // Debug: Log event data after refresh
            Log::info('Event data after refresh:', [
                'id' => $event->id,
                'title' => $event->title,
                'description' => $event->description,
                'date' => $event->date,
                'start_time' => $event->start_time,
                'end_time' => $event->end_time,
                'is_active' => $event->is_active,
                // Payment fields
                'is_paid_event' => $event->is_paid_event,
                'ticket_price' => $event->ticket_price,
                'currency' => $event->currency,
                'available_payment_methods' => $event->available_payment_methods,
                'early_bird_enabled' => $event->early_bird_enabled,
                'early_bird_discount' => $event->early_bird_discount,
                'payment_expiry_hours' => $event->payment_expiry_hours,
                'auto_approve_payments' => $event->auto_approve_payments,
                'allows_refund' => $event->allows_refund,
                'requires_approval' => $event->requires_approval,
                'max_tickets_per_user' => $event->max_tickets_per_user
            ]);

            DB::commit();

            Log::info('Event updated successfully', [
                'event_id' => $event->id,
                'title' => $event->title,
                'description' => $event->description,
                'updated_by' => auth()->id()
            ]);

            // Debug: Log the actual data being returned
            Log::info('Event data being returned:', [
                'id' => $event->id,
                'title' => $event->title,
                'description' => $event->description,
                'date' => $event->date,
                'start_time' => $event->start_time,
                'end_time' => $event->end_time
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Event berhasil diperbarui',
                'data' => new EventResource($event)
            ])
            ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
            ->header('Pragma', 'no-cache')
            ->header('Expires', '0');

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Event tidak ditemukan'
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating event: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memperbarui event',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Remove the specified event (admin only)
     */
    public function destroy($id): JsonResponse
    {
        try {
            $event = Event::findOrFail($id);

            // Check if event has participants
            if ($event->eventParticipants()->count() > 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Tidak dapat menghapus event yang sudah memiliki peserta. Gunakan force delete untuk menghapus beserta semua pesertanya.'
                ], 422);
            }

            // Force delete (permanently remove from database)
            $event->forceDelete();

            Log::info('Event deleted successfully', [
                'event_id' => $id,
                'deleted_by' => auth()->id()
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Event berhasil dihapus'
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Event tidak ditemukan'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Error deleting event: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menghapus event',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Force delete event with all participants (admin only)
     */
    public function forceDestroy($id): JsonResponse
    {
        try {
            $event = Event::findOrFail($id);

            // Delete all participants first
            $participantCount = $event->eventParticipants()->count();
            $event->eventParticipants()->delete();

            // Delete all certificates related to this event
            $event->certificates()->delete();

            // Delete event files
            if ($event->flyer_path) {
                Storage::disk('public')->delete($event->flyer_path);
            }
            if ($event->certificate_template_path) {
                Storage::disk('public')->delete($event->certificate_template_path);
            }

            // Force delete the event (permanently remove from database)
            $event->forceDelete();

            Log::info('Event force deleted successfully', [
                'event_id' => $id,
                'participants_deleted' => $participantCount,
                'deleted_by' => auth()->id()
            ]);

            return response()->json([
                'status' => 'success',
                'message' => "Event dan {$participantCount} peserta berhasil dihapus"
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Event tidak ditemukan'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Error force deleting event: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menghapus event'
            ], 500);
        }
    }


    /**
     * Mark attendance for an event
     */
    public function attendance(Request $request, $id): JsonResponse
    {
        try {
            $event = Event::findOrFail($id);
            $userId = auth()->id();

            // Check if attendance is open
            if (!$event->isAttendanceOpen()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Daftar hadir belum dibuka atau sudah ditutup'
                ], 422);
            }

            // Find event participant
            $eventParticipant = $event->eventParticipants()
                ->where('participant_id', $userId)
                ->first();

            if (!$eventParticipant) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Anda tidak terdaftar untuk event ini'
                ], 422);
            }

            // Check if already verified
            if ($eventParticipant->is_attendance_verified) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Kehadiran sudah diverifikasi'
                ], 422);
            }

            // Verify attendance token
            $token = $request->input('attendance_token');
            if (!$eventParticipant->verifyAttendance($token)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Token kehadiran tidak valid'
                ], 422);
            }

            // Create attendance record
            Attendance::create([
                'event_id' => $event->id,
                'participant_id' => $userId,
                'event_participant_id' => $eventParticipant->id,
                'time_in' => now(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Kehadiran berhasil diverifikasi',
                'data' => [
                    'attendance_verified_at' => $eventParticipant->attendance_verified_at,
                    'can_receive_certificate' => $eventParticipant->can_receive_certificate
                ]
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Event tidak ditemukan'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Error marking attendance: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memverifikasi kehadiran',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Get user's registered events with attendance and certificate status
     */
    public function myEvents(): JsonResponse
    {
        try {
            $userId = auth()->id();

            $eventParticipants = EventParticipant::with([
                'event',
                'attendance',
                'certificate'
            ])
            ->where('participant_id', $userId)
            ->orderBy('created_at', 'desc')
            ->paginate(12);

            $events = $eventParticipants->filter(function ($participant) {
                // Only include participants with valid events
                return $participant->event !== null;
            })->map(function ($participant) {
                $event = $participant->event;
                $now = now();
                // Use start_time directly if it's already a datetime, otherwise combine with date
                if ($event->start_time instanceof \Carbon\Carbon) {
                    $eventDate = $event->start_time;
                } else {
                    $eventDate = \Carbon\Carbon::parse($event->start_time);
                }

                // Determine event status
                $status = 'upcoming';
                if ($eventDate->isPast()) {
                    $status = 'completed';
                } elseif ($eventDate->isToday()) {
                    $status = 'ongoing';
                }

                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'description' => $event->description,
                    'date' => $event->date,
                    'start_time' => $event->start_time,
                    'end_time' => $event->end_time,
                    'location' => $event->location,
                    'image' => $event->flyer_path ? asset('storage/' . $event->flyer_path) : null,
                    'max_participants' => $event->max_participants,
                    'current_participants' => $event->eventParticipants()->count(),
                    'status' => $status,
                    'registration_number' => $participant->registration_number,
                    'attendance_token' => $participant->attendance_token,
                    'attendance_status' => $participant->attendance_status,
                    'is_attendance_verified' => $participant->is_attendance_verified,
                    'attendance_verified_at' => $participant->attendance_verified_at,
                    'has_certificate' => $participant->certificate ? true : false,
                    'certificate_number' => $participant->certificate ? $participant->certificate->certificate_number : null,
                    'certificate_issued_at' => $participant->certificate ? $participant->certificate->created_at : null,
                    'can_attend' => $participant->canAttend(),
                    'registered_at' => $participant->created_at,
                ];
            });

            return response()->json([
                'status' => 'success',
                'data' => $events,
                'pagination' => [
                    'current_page' => $eventParticipants->currentPage(),
                    'last_page' => $eventParticipants->lastPage(),
                    'per_page' => $eventParticipants->perPage(),
                    'total' => $eventParticipants->total(),
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching user events: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data event',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Get user's certificates with detailed information
     */
    public function myCertificates(): JsonResponse
    {
        try {
            $userId = auth()->id();

            $certificates = Certificate::with([
                'eventParticipant.event',
                'eventParticipant.participant',
                'eventParticipant.attendance'
            ])
            ->whereHas('eventParticipant', function ($query) use ($userId) {
                $query->where('participant_id', $userId);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(12);

            $certificateData = $certificates->filter(function ($certificate) {
                // Only include certificates with valid event participants and events
                return $certificate->eventParticipant && $certificate->eventParticipant->event;
            })->map(function ($certificate) {
                $eventParticipant = $certificate->eventParticipant;
                $event = $eventParticipant->event;

                return [
                    'id' => $certificate->id,
                    'certificate_number' => $certificate->certificate_number,
                    'issued_at' => $certificate->created_at,
                    'event' => [
                        'id' => $event->id,
                        'title' => $event->title,
                        'date' => $event->date,
                        'start_time' => $event->start_time,
                        'end_time' => $event->end_time,
                        'location' => $event->location,
                        'image' => $event->image,
                    ],
                    'participant' => [
                        'registration_number' => $eventParticipant->registration_number,
                        'attendance_verified_at' => $eventParticipant->attendance_verified_at,
                        'attendance_status' => $eventParticipant->attendance_status,
                    ],
                    'attendance' => $eventParticipant->attendance ? [
                        'time_in' => $eventParticipant->attendance->time_in,
                        'time_out' => $eventParticipant->attendance->time_out,
                    ] : null,
                    'download_url' => route('certificates.download', $certificate->id),
                    'verify_url' => route('certificates.verify', $certificate->certificate_number),
                ];
            });

            return response()->json([
                'status' => 'success',
                'data' => $certificateData,
                'pagination' => [
                    'current_page' => $certificates->currentPage(),
                    'last_page' => $certificates->lastPage(),
                    'per_page' => $certificates->perPage(),
                    'total' => $certificates->total(),
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching user certificates: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data sertifikat',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Get dashboard statistics (admin only)
     */
    public function statistics(): JsonResponse
    {
        try {
            $totalEvents = Event::count();
            $totalParticipants = EventParticipant::count();
            $totalCertificates = Certificate::count();
            $upcomingEvents = Event::where('date', '>=', now()->toDateString())
                ->where('date', '<=', now()->addDays(30)->toDateString())
                ->count();
            $recentActivities = DB::table('activity_log')
                ->join('users', 'activity_log.causer_id', '=', 'users.id')
                ->select('activity_log.*', 'users.name as user_name')
                ->orderBy('activity_log.created_at', 'desc')
                ->take(10)
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'total_events' => $totalEvents,
                    'total_participants' => $totalParticipants,
                    'total_certificates' => $totalCertificates,
                    'upcoming_events' => $upcomingEvents,
                    'recent_activities' => $recentActivities
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error retrieving statistics: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve statistics',
                'error' => config('app.debug') ? $e->getMessage() : 'Please try again later.'
            ], 500);
        }
    }

    /**
     * Get chart data for dashboard (admin only)
     */
    public function chartData(Request $request): JsonResponse
    {
        try {
            $year = $request->get('year', now()->year);

            // Monthly events data (Jan-Dec)
            $monthlyEvents = Event::selectRaw('MONTH(date) as month, COUNT(*) as count')
                ->whereYear('date', $year)
                ->groupBy('month')
                ->orderBy('month')
                ->get();

            // Monthly participants data (Jan-Dec) - only from participants who attended
            $monthlyParticipants = DB::table('event_participant')
                ->join('events', 'event_participant.event_id', '=', 'events.id')
                ->join('attendances', function($join) {
                    $join->on('event_participant.participant_id', '=', 'attendances.participant_id')
                         ->on('event_participant.event_id', '=', 'attendances.event_id');
                })
                ->selectRaw('MONTH(events.date) as month, COUNT(DISTINCT event_participant.participant_id) as count')
                ->whereYear('events.date', $year)
                ->groupBy('month')
                ->orderBy('month')
                ->get();

            // Top 10 events with most participants
            $topEvents = Event::withCount('eventParticipants')
                ->orderBy('event_participants_count', 'desc')
                ->take(10)
                ->get(['id', 'title', 'date', 'event_participants_count']);

            return response()->json([
                'status' => 'success',
                'data' => [
                    'monthly_events' => $monthlyEvents,
                    'monthly_participants' => $monthlyParticipants,
                    'top_events' => $topEvents
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error retrieving chart data: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve chart data',
                'error' => config('app.debug') ? $e->getMessage() : 'Please try again later.'
            ], 500);
        }
    }

    /**
     * Export dashboard data (admin only)
     */
    public function exportDashboard(Request $request)
    {
        try {
            $year = $request->get('year', now()->year);
            $filename = 'dashboard_data_' . $year . '_' . now()->format('Y-m-d_H-i-s') . '.xlsx';

            return Excel::download(new DashboardExport($year), $filename);

        } catch (\Exception $e) {
            Log::error('Error exporting dashboard data: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengekspor data dashboard',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Export events data (admin only)
     */
    public function exportEvents()
    {
        try {
            $filename = 'events_' . now()->format('Y-m-d_H-i-s') . '.xlsx';

            // Get all events for export
            $events = Event::all();
            $exportData = collect();

            foreach ($events as $event) {
                $exportData = $exportData->merge(
                    EventParticipant::with('participant')
                        ->where('event_id', $event->id)
                        ->get()
                        ->map(function($participant) use ($event) {
                            return (object) [
                                'event_title' => $event->title,
                                'event_date' => $event->date,
                                'registration_number' => $participant->registration_number,
                                'participant_name' => $participant->participant->name,
                                'email' => $participant->participant->email,
                                'phone' => $participant->participant->phone,
                                'registration_date' => $participant->created_at,
                            ];
                        })
                );
            }

            return Excel::download(new DashboardExport(), $filename);

        } catch (\Exception $e) {
            Log::error('Error exporting events: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengekspor data event',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Export participants data for specific event (admin only)
     */
    public function exportParticipants($eventId)
    {
        try {
            $event = Event::findOrFail($eventId);
            $filename = 'participants_' . str_replace(' ', '_', $event->title) . '_' . now()->format('Y-m-d_H-i-s') . '.xlsx';

            return Excel::download(new EventParticipantsExport($event), $filename);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Event tidak ditemukan'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Error exporting participants: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengekspor data peserta',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Get events with certificate settings (for certificate builder)
     */
    public function getEventsWithCertificates(): JsonResponse
    {
        try {
            $events = Event::where('has_certificate', true)
                ->select(['id', 'title', 'date', 'start_time', 'end_time', 'location'])
                ->orderBy('date', 'desc')
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $events
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching events with certificates: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data event',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Get participants for specific event (for certificate builder)
     */
    public function getEventParticipants($eventId): JsonResponse
    {
        try {
            $event = Event::findOrFail($eventId);

            $participants = EventParticipant::with('participant')
                ->where('event_id', $eventId)
                ->get()
                ->map(function ($participant) {
                    // Get name from participant table
                    $name = $participant->participant->name ?? 'Unknown';
                    $email = $participant->participant->email ?? 'Unknown';

                    return [
                        'id' => $participant->id,
                        'name' => $name,
                        'email' => $email,
                        'registration_number' => $participant->registration_number,
                        'attendance_verified_at' => $participant->attendance_verified_at,
                        'has_received_certificate' => $participant->has_received_certificate,
                    ];
                });

            return response()->json([
                'status' => 'success',
                'data' => $participants
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Event tidak ditemukan'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Error fetching event participants: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data peserta',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Register user for an event
     */
    public function register(Request $request, $eventId): JsonResponse
    {
        try {
            $event = Event::findOrFail($eventId);
            $user = auth()->user();

            // Validate registration data
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'phone' => 'required|string|max:20',
                'emergency_contact' => 'required|string|max:255',
                'emergency_phone' => 'required|string|max:20',
                'special_needs' => 'nullable|string|max:500',
            ], [
                'name.required' => 'Nama lengkap harus diisi',
                'email.required' => 'Email harus diisi',
                'email.email' => 'Format email tidak valid',
                'phone.required' => 'Nomor telepon harus diisi',
                'emergency_contact.required' => 'Kontak darurat harus diisi',
                'emergency_phone.required' => 'Nomor telepon darurat harus diisi',
            ]);

            // Check if registration is still open
            if (!$event->is_registration_open) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Pendaftaran untuk event ini sudah ditutup',
                ], 400);
            }

            // Check if event is full
            if ($event->current_participants_count >= $event->max_participants) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Event ini sudah penuh',
                ], 400);
            }

            // Check if user already registered
            $existingRegistration = EventParticipant::where('event_id', $eventId)
                ->where('participant_id', $user->id)
                ->first();

            if ($existingRegistration) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Anda sudah terdaftar untuk event ini',
                ], 400);
            }

            // Create registration
            $participant = EventParticipant::create([
                'event_id' => $eventId,
                'participant_id' => $user->id,
                'registration_number' => 'REG-' . $eventId . '-' . $user->id . '-' . time(),
                'attendance_status' => 'pending',
            ]);

            // Send registration notification
            try {
                $notificationService = app(NotificationService::class);
                $notificationService->sendEventRegistrationNotification($event, $user);
            } catch (\Exception $e) {
                Log::warning('Failed to send registration notification', [
                    'event_id' => $event->id,
                    'user_id' => $user->id,
                    'error' => $e->getMessage()
                ]);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Pendaftaran berhasil!',
                'data' => [
                    'participant_id' => $participant->id,
                    'event_title' => $event->title,
                    'registration_number' => $participant->registration_number,
                    'registration_date' => $participant->created_at,
                ]
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data tidak valid',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Event registration error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mendaftar ke event',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
