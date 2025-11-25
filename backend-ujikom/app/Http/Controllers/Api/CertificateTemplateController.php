<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Certificate;
use App\Services\CertificateGeneratorService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class CertificateTemplateController extends Controller
{
    protected $certificateService;

    public function __construct(CertificateGeneratorService $certificateService)
    {
        $this->certificateService = $certificateService;
    }

    /**
     * Upload certificate template for event
     * EO uploads background image template
     */
    public function uploadTemplate(Request $request, $eventId): JsonResponse
    {
        try {
            $event = Event::findOrFail($eventId);

            // Validate user owns this event
            if (Auth::user()->role === 'event_organizer' && $event->user_id !== Auth::id()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Anda tidak memiliki akses ke event ini'
                ], 403);
            }

            $validated = $request->validate([
                'template' => 'required|image|mimes:jpeg,png,jpg|max:5120', // Max 5MB
                'has_certificate' => 'boolean',
            ]);

            DB::beginTransaction();

            // Delete old template if exists
            if ($event->certificate_template_path) {
                Storage::delete($event->certificate_template_path);
            }

            // Store new template
            $templatePath = $request->file('template')->store('certificate_templates', 'public');

            // Update event
            $event->update([
                'certificate_template_path' => $templatePath,
                'has_certificate' => $validated['has_certificate'] ?? true,
            ]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Template sertifikat berhasil diupload',
                'data' => [
                    'template_url' => Storage::url($templatePath),
                    'event' => $event
                ]
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error uploading certificate template: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal upload template',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Update certificate text settings (positions, font, etc)
     */
    public function updateTextSettings(Request $request, $eventId): JsonResponse
    {
        try {
            $event = Event::findOrFail($eventId);

            // Validate user owns this event
            if (Auth::user()->role === 'event_organizer' && $event->user_id !== Auth::id()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Anda tidak memiliki akses ke event ini'
                ], 403);
            }

            $validated = $request->validate([
                'text_settings' => 'required|array',
                'text_settings.participant_name' => 'required|array',
                'text_settings.participant_name.x' => 'required|integer',
                'text_settings.participant_name.y' => 'required|integer',
                'text_settings.participant_name.font_size' => 'required|integer|min:10|max:100',
                'text_settings.participant_name.color' => 'required|string',
                'text_settings.participant_name.align' => 'required|in:left,center,right',
                'text_settings.event_date' => 'nullable|array',
                'text_settings.certificate_number' => 'nullable|array',
                'auto_generate' => 'boolean',
            ]);

            $event->update([
                'certificate_text_settings' => $validated['text_settings'],
                'auto_generate_certificate' => $validated['auto_generate'] ?? true,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Pengaturan text berhasil disimpan',
                'data' => $event
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error updating text settings: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal update pengaturan',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Generate certificates for all participants who attended
     * Called when event status changes to completed
     */
    public function generateForEvent($eventId): JsonResponse
    {
        try {
            $event = Event::findOrFail($eventId);

            // Validate user owns this event
            if (Auth::user()->role === 'event_organizer' && $event->user_id !== Auth::id()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Anda tidak memiliki akses ke event ini'
                ], 403);
            }

            $result = $this->certificateService->generateCertificatesForEvent($event);

            if (!$result['success']) {
                return response()->json([
                    'status' => 'error',
                    'message' => $result['message']
                ], 400);
            }

            return response()->json([
                'status' => 'success',
                'message' => $result['message'],
                'data' => [
                    'generated' => $result['generated'],
                    'total_participants' => $result['total_participants'],
                    'errors' => $result['errors'] ?? []
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error generating certificates for event: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal generate sertifikat',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get user's certificates (for participants)
     */
    public function getMyCertificates(): JsonResponse
    {
        try {
            $userId = Auth::id();

            $certificates = Certificate::with(['event'])
                ->where('participant_id', $userId)
                ->where('status', 'generated')
                ->orderBy('generated_at', 'desc')
                ->get()
                ->map(function ($certificate) {
                    return [
                        'id' => $certificate->id,
                        'certificate_number' => $certificate->certificate_number,
                        'participant_name' => $certificate->participant_name,
                        'event' => [
                            'id' => $certificate->event->id,
                            'title' => $certificate->event_title,
                            'date' => $certificate->event_date,
                            'location' => $certificate->event->location,
                        ],
                        'generated_at' => $certificate->generated_at,
                        'download_count' => $certificate->download_count,
                        'is_ready' => $certificate->isReadyToDownload(),
                    ];
                });

            return response()->json([
                'status' => 'success',
                'data' => $certificates
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting user certificates: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data sertifikat',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Download certificate PDF (for participants)
     */
    public function downloadCertificate($certificateId)
    {
        try {
            $certificate = Certificate::findOrFail($certificateId);

            // Validate user owns this certificate
            if ($certificate->participant_id !== Auth::id()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Anda tidak memiliki akses ke sertifikat ini'
                ], 403);
            }

            if (!$certificate->isReadyToDownload()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Sertifikat belum siap untuk didownload'
                ], 400);
            }

            // Mark as downloaded
            $this->certificateService->markAsDownloaded($certificate);

            // Return file
            $filePath = Storage::path($certificate->file_path);

            if (!file_exists($filePath)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'File sertifikat tidak ditemukan'
                ], 404);
            }

            return response()->download(
                $filePath,
                $certificate->file_name ?? 'certificate.pdf',
                [
                    'Content-Type' => 'application/pdf',
                ]
            );

        } catch (\Exception $e) {
            Log::error('Error downloading certificate: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal download sertifikat',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Preview certificate template with sample data
     */
    public function previewTemplate($eventId): JsonResponse
    {
        try {
            $event = Event::findOrFail($eventId);

            // Validate user owns this event
            if (Auth::user()->role === 'event_organizer' && $event->user_id !== Auth::id()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Anda tidak memiliki akses ke event ini'
                ], 403);
            }

            if (!$event->certificate_template_path) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Template belum diupload'
                ], 400);
            }

            return response()->json([
                'status' => 'success',
                'data' => [
                    'template_url' => Storage::url($event->certificate_template_path),
                    'text_settings' => $event->certificate_text_settings,
                    'sample_data' => [
                        'participant_name' => 'John Doe',
                        'event_title' => $event->title,
                        'event_date' => $event->date,
                        'certificate_number' => 'CERT-SAMPLE-001',
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error previewing template: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal preview template',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get all certificates (Admin only)
     */
    public function getAllCertificates(): JsonResponse
    {
        try {
            $certificates = Certificate::with(['event', 'eventParticipant.user'])
                ->orderBy('generated_at', 'desc')
                ->get()
                ->map(function ($certificate) {
                    return [
                        'id' => $certificate->id,
                        'certificate_number' => $certificate->certificate_number,
                        'participant_name' => $certificate->participant_name,
                        'participant_id' => $certificate->participant_id,
                        'event' => [
                            'id' => $certificate->event->id,
                            'title' => $certificate->event_title,
                            'date' => $certificate->event_date,
                        ],
                        'status' => $certificate->status,
                        'generated_at' => $certificate->generated_at,
                        'downloaded_at' => $certificate->downloaded_at,
                        'download_count' => $certificate->download_count,
                        'is_ready' => $certificate->isReadyToDownload(),
                    ];
                });

            return response()->json([
                'status' => 'success',
                'data' => $certificates
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting all certificates: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data certificates',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}
