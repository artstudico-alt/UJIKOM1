<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class CertificateDownloadController extends Controller
{
    /**
     * Download certificate PDF
     */
    public function download(Request $request, $certificateId)
    {
        try {
            $certificate = Certificate::findOrFail($certificateId);
            
            // Check if user has access to this certificate
            if ($request->user()->id !== $certificate->participant_id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Anda tidak memiliki akses ke sertifikat ini'
                ], 403);
            }

            // Check if certificate file exists
            if (!$certificate->file_path || !Storage::disk('public')->exists($certificate->file_path)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'File sertifikat tidak ditemukan'
                ], 404);
            }

            // Increment download count
            $certificate->increment('download_count');

            // Get file content
            $fileContent = Storage::disk('public')->get($certificate->file_path);
            
            // Return file download response
            return response($fileContent)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'attachment; filename="' . $certificate->file_name . '"')
                ->header('Content-Length', strlen($fileContent));

        } catch (\Exception $e) {
            Log::error('Certificate download failed', [
                'certificate_id' => $certificateId,
                'user_id' => $request->user()->id ?? null,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengunduh sertifikat'
            ], 500);
        }
    }

    /**
     * Preview certificate PDF
     */
    public function preview(Request $request, $certificateId)
    {
        try {
            $certificate = Certificate::findOrFail($certificateId);
            
            // Check if user has access to this certificate
            if ($request->user()->id !== $certificate->participant_id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Anda tidak memiliki akses ke sertifikat ini'
                ], 403);
            }

            // Check if certificate file exists
            if (!$certificate->file_path || !Storage::disk('public')->exists($certificate->file_path)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'File sertifikat tidak ditemukan'
                ], 404);
            }

            // Get file content
            $fileContent = Storage::disk('public')->get($certificate->file_path);
            
            // Return file preview response
            return response($fileContent)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'inline; filename="' . $certificate->file_name . '"')
                ->header('Content-Length', strlen($fileContent));

        } catch (\Exception $e) {
            Log::error('Certificate preview failed', [
                'certificate_id' => $certificateId,
                'user_id' => $request->user()->id ?? null,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menampilkan sertifikat'
            ], 500);
        }
    }

    /**
     * Get certificate info
     */
    public function info(Request $request, $certificateId)
    {
        try {
            $certificate = Certificate::findOrFail($certificateId);
            
            // Check if user has access to this certificate
            if ($request->user()->id !== $certificate->participant_id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Anda tidak memiliki akses ke sertifikat ini'
                ], 403);
            }

            return response()->json([
                'status' => 'success',
                'data' => [
                    'id' => $certificate->id,
                    'certificate_number' => $certificate->certificate_number,
                    'participant_name' => $certificate->participant_name,
                    'event_title' => $certificate->event_title,
                    'event_date' => $certificate->event_date,
                    'issued_at' => $certificate->issued_at,
                    'download_count' => $certificate->download_count,
                    'file_name' => $certificate->file_name,
                    'file_size' => $certificate->file_size,
                    'status' => $certificate->status,
                    'download_url' => route('certificates.download', $certificate->id),
                    'preview_url' => route('certificates.preview', $certificate->id),
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Certificate info failed', [
                'certificate_id' => $certificateId,
                'user_id' => $request->user()->id ?? null,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mendapatkan informasi sertifikat'
            ], 500);
        }
    }
}
