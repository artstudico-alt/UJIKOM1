<?php

namespace App\Services;

use App\Models\Token;
use App\Models\EventParticipant;
use App\Models\Event;
use App\Models\User;
use App\Mail\TokenEmail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class TokenService
{
    /**
     * Generate and send token to participant
     */
    public function generateAndSendToken(EventParticipant $eventParticipant)
    {
        try {
            // Generate unique 10-digit token
            $token = $this->generateUniqueToken();
            
            // Create token record
            $tokenRecord = Token::create([
                'participant_id' => $eventParticipant->participant_id,
                'event_id' => $eventParticipant->event_id,
                'token' => $token,
                'email' => $eventParticipant->participant->email,
                'expires_at' => now()->addDays(7), // Token expires in 7 days
            ]);

            // Send email with token
            $this->sendTokenEmail($eventParticipant, $token);

            // Update event participant with token info
            $eventParticipant->update([
                'attendance_token' => $token,
                'token_generated_at' => now(),
                'token_expires_at' => $tokenRecord->expires_at,
                'attendance_status' => 'pending',
                'verification_method' => 'token',
            ]);

            Log::info('Token generated and sent', [
                'participant_id' => $eventParticipant->participant_id,
                'event_id' => $eventParticipant->event_id,
                'token' => $token
            ]);

            return $token;

        } catch (\Exception $e) {
            Log::error('Failed to generate and send token', [
                'participant_id' => $eventParticipant->participant_id,
                'event_id' => $eventParticipant->event_id,
                'error' => $e->getMessage()
            ]);
            
            throw $e;
        }
    }

    /**
     * Generate unique 10-digit token
     */
    private function generateUniqueToken()
    {
        do {
            $token = str_pad(mt_rand(0, 9999999999), 10, '0', STR_PAD_LEFT);
        } while (Token::where('token', $token)->exists());

        return $token;
    }

    /**
     * Send token via email
     */
    private function sendTokenEmail(EventParticipant $eventParticipant, string $token)
    {
        $participant = $eventParticipant->participant;
        $event = $eventParticipant->event;

        Mail::to($participant->email)->send(new TokenEmail(
            $participant,
            $event,
            $token
        ));
    }

    /**
     * Verify token for attendance
     */
    public function verifyTokenForAttendance(string $token, int $eventId)
    {
        $tokenRecord = Token::where('token', $token)
                           ->where('event_id', $eventId)
                           ->where('is_used', false)
                           ->where('expires_at', '>', now())
                           ->first();

        if (!$tokenRecord) {
            return [
                'success' => false,
                'message' => 'Token tidak valid atau sudah expired'
            ];
        }

        // Find event participant
        $eventParticipant = EventParticipant::where('participant_id', $tokenRecord->participant_id)
                                           ->where('event_id', $eventId)
                                           ->first();

        if (!$eventParticipant) {
            return [
                'success' => false,
                'message' => 'Peserta tidak ditemukan untuk event ini'
            ];
        }

        // Check if already verified
        if ($eventParticipant->is_attendance_verified) {
            return [
                'success' => false,
                'message' => 'Anda sudah melakukan daftar hadir sebelumnya'
            ];
        }

        // Verify attendance
        $verified = $eventParticipant->verifyAttendance($token);

        if ($verified) {
            // Mark token as used
            $tokenRecord->update([
                'is_used' => true,
                'used_at' => now()
            ]);

            // Auto-generate certificate after successful attendance
            $this->generateCertificateForParticipant($eventParticipant);

            return [
                'success' => true,
                'message' => 'Daftar hadir berhasil! Sertifikat telah dibuat dan siap diunduh.',
                'participant' => $eventParticipant,
                'certificate_generated' => true
            ];
        }

        return [
            'success' => false,
            'message' => 'Gagal melakukan verifikasi daftar hadir'
        ];
    }

    /**
     * Get token status for participant
     */
    public function getTokenStatus(int $participantId, int $eventId)
    {
        $eventParticipant = EventParticipant::where('participant_id', $participantId)
                                           ->where('event_id', $eventId)
                                           ->first();

        if (!$eventParticipant) {
            return null;
        }

        return [
            'has_token' => !empty($eventParticipant->attendance_token),
            'token' => $eventParticipant->attendance_token,
            'is_verified' => $eventParticipant->is_attendance_verified,
            'can_get_certificate' => $eventParticipant->can_receive_certificate,
            'token_expires_at' => $eventParticipant->token_expires_at,
            'is_token_expired' => $eventParticipant->token_expires_at && $eventParticipant->token_expires_at->isPast()
        ];
    }

    /**
     * Generate certificate for participant after successful attendance
     */
    private function generateCertificateForParticipant(EventParticipant $eventParticipant)
    {
        try {
            // Check if certificate already exists
            $existingCertificate = $eventParticipant->certificate;
            if ($existingCertificate) {
                Log::info('Certificate already exists for participant', [
                    'participant_id' => $eventParticipant->participant_id,
                    'event_id' => $eventParticipant->event_id,
                    'certificate_id' => $existingCertificate->id
                ]);
                return $existingCertificate;
            }

            // Generate certificate
            $certificate = \App\Models\Certificate::create([
                'event_participant_id' => $eventParticipant->id,
                'participant_id' => $eventParticipant->participant_id,
                'event_id' => $eventParticipant->event_id,
                'certificate_number' => $this->generateCertificateNumber($eventParticipant),
                'participant_name' => $eventParticipant->participant->name,
                'event_title' => $eventParticipant->event->title,
                'event_date' => $eventParticipant->event->date,
                'issued_at' => now(),
                'status' => 'issued'
            ]);

            // Generate PDF certificate
            $this->generateCertificatePDF($certificate);

            Log::info('Certificate generated successfully', [
                'participant_id' => $eventParticipant->participant_id,
                'event_id' => $eventParticipant->event_id,
                'certificate_id' => $certificate->id
            ]);

            return $certificate;

        } catch (\Exception $e) {
            Log::error('Failed to generate certificate', [
                'participant_id' => $eventParticipant->participant_id,
                'event_id' => $eventParticipant->event_id,
                'error' => $e->getMessage()
            ]);
            
            throw $e;
        }
    }

    /**
     * Generate unique certificate number
     */
    private function generateCertificateNumber(EventParticipant $eventParticipant)
    {
        $eventCode = strtoupper(substr($eventParticipant->event->title, 0, 3));
        $year = date('Y');
        $month = date('m');
        $participantId = str_pad($eventParticipant->participant_id, 4, '0', STR_PAD_LEFT);
        
        return "CERT-{$eventCode}-{$year}{$month}-{$participantId}";
    }

    /**
     * Generate PDF certificate
     */
    private function generateCertificatePDF(\App\Models\Certificate $certificate)
    {
        try {
            // Create certificate PDF using DomPDF
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('certificates.pdf', [
                'certificate' => $certificate,
                'participant' => $certificate->participant,
                'event' => $certificate->event
            ]);

            // Set paper size and orientation
            $pdf->setPaper('A4', 'landscape');

            // Generate PDF content
            $pdfContent = $pdf->output();

            // Save PDF to storage
            $filename = "certificate_{$certificate->certificate_number}.pdf";
            $filePath = "certificates/{$filename}";
            
            \Storage::disk('public')->put($filePath, $pdfContent);

            // Update certificate with file path
            $certificate->update([
                'file_path' => $filePath,
                'file_name' => $filename,
                'file_size' => strlen($pdfContent)
            ]);

            return $filePath;

        } catch (\Exception $e) {
            Log::error('Failed to generate certificate PDF', [
                'certificate_id' => $certificate->id,
                'error' => $e->getMessage()
            ]);
            
            throw $e;
        }
    }
}
