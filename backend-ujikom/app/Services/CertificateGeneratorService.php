<?php

namespace App\Services;

use App\Models\Certificate;
use App\Models\Event;
use App\Models\EventParticipant;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManagerStatic as Image;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class CertificateGeneratorService
{
    /**
     * Generate certificate untuk satu peserta
     *
     * @param EventParticipant $participant
     * @return Certificate|null
     */
    public function generateCertificate(EventParticipant $participant)
    {
        $event = $participant->event;

        // Check if event has certificate feature enabled
        if (!$event->has_certificate || !$event->certificate_template_path) {
            return null;
        }

        // Check if participant has attended (verified)
        if (!$participant->is_attendance_verified) {
            return null;
        }

        // Check if certificate already exists
        $existingCertificate = Certificate::where('event_id', $event->id)
            ->where('participant_id', $participant->participant_id)
            ->first();

        if ($existingCertificate) {
            return $existingCertificate;
        }

        // Generate certificate number
        $certificateNumber = $this->generateCertificateNumber($event->id, $participant->participant_id);

        // Create certificate record
        $certificate = Certificate::create([
            'event_id' => $event->id,
            'participant_id' => $participant->participant_id,
            'event_participant_id' => $participant->id,
            'certificate_number' => $certificateNumber,
            'certificate_path' => '', // Will be updated after PDF generation
            'participant_name' => $participant->participant->name,
            'event_title' => $event->title,
            'event_date' => $event->date,
            'status' => 'pending',
        ]);

        // Generate PDF
        $pdfPath = $this->generatePDF($certificate, $event, $participant);

        if ($pdfPath) {
            $certificate->update([
                'file_path' => $pdfPath,
                'file_name' => basename($pdfPath),
                'file_size' => Storage::size($pdfPath),
                'certificate_path' => $pdfPath,
                'status' => 'generated',
                'generated_at' => now(),
                'issued_at' => now(),
            ]);

            return $certificate;
        }

        return null;
    }

    /**
     * Generate certificates untuk semua peserta yang hadir di suatu event
     *
     * @param Event $event
     * @return array
     */
    public function generateCertificatesForEvent(Event $event)
    {
        if (!$event->has_certificate || !$event->certificate_template_path) {
            return [
                'success' => false,
                'message' => 'Event tidak memiliki fitur sertifikat atau template belum diupload',
                'generated' => 0
            ];
        }

        // Get all participants who attended
        $participants = EventParticipant::where('event_id', $event->id)
            ->whereNotNull('attendance_verified_at')
            ->get();

        $generated = 0;
        $errors = [];

        foreach ($participants as $participant) {
            try {
                $certificate = $this->generateCertificate($participant);
                if ($certificate) {
                    $generated++;
                }
            } catch (\Exception $e) {
                $errors[] = "Peserta {$participant->participant->name}: " . $e->getMessage();
            }
        }

        // Update event certificates_generated_at timestamp
        $event->update(['certificates_generated_at' => now()]);

        return [
            'success' => true,
            'message' => "Berhasil generate {$generated} sertifikat",
            'generated' => $generated,
            'total_participants' => $participants->count(),
            'errors' => $errors
        ];
    }

    /**
     * Generate PDF file dengan overlay text
     *
     * @param Certificate $certificate
     * @param Event $event
     * @param EventParticipant $participant
     * @return string|null Path to generated PDF
     */
    protected function generatePDF($certificate, $event, $participant)
    {
        try {
            // Get template image path
            $templatePath = Storage::path($event->certificate_template_path);

            if (!file_exists($templatePath)) {
                throw new \Exception("Template file tidak ditemukan");
            }

            // Load template image
            $image = Image::make($templatePath);

            // Get text settings from event
            $textSettings = $event->certificate_text_settings ?? [];

            // Prepare data
            $data = [
                'participant_name' => $participant->participant->name,
                'event_title' => $event->title,
                'event_date' => Carbon::parse($event->date)->locale('id')->translatedFormat('d F Y'),
                'certificate_number' => $certificate->certificate_number,
            ];

            // Overlay text on image
            foreach ($textSettings as $field => $settings) {
                if (isset($data[$field])) {
                    $this->addTextToImage(
                        $image,
                        $data[$field],
                        $settings['x'] ?? 400,
                        $settings['y'] ?? 300,
                        $settings['font_size'] ?? 24,
                        $settings['color'] ?? '#000000',
                        $settings['align'] ?? 'center'
                    );
                }
            }

            // Save image as PNG temporarily
            $tempImageName = 'cert_temp_' . $certificate->certificate_number . '.png';
            $tempImagePath = storage_path('app/temp/' . $tempImageName);

            // Create temp directory if not exists
            if (!file_exists(storage_path('app/temp'))) {
                mkdir(storage_path('app/temp'), 0755, true);
            }

            $image->save($tempImagePath);

            // Convert image to PDF
            $pdfFileName = 'certificate_' . $certificate->certificate_number . '.pdf';
            $pdfPath = 'certificates/' . $pdfFileName;

            // Create certificates directory if not exists
            if (!Storage::exists('certificates')) {
                Storage::makeDirectory('certificates');
            }

            // Create HTML for PDF with the image
            $html = view('certificates.image-template', [
                'imagePath' => $tempImagePath,
                'certificate' => $certificate
            ])->render();

            // Generate PDF
            $pdf = Pdf::loadHTML($html)
                ->setPaper('a4', 'landscape')
                ->setOption('isHtml5ParserEnabled', true)
                ->setOption('isRemoteEnabled', true);

            // Save PDF
            Storage::put($pdfPath, $pdf->output());

            // Clean up temp image
            if (file_exists($tempImagePath)) {
                unlink($tempImagePath);
            }

            return $pdfPath;

        } catch (\Exception $e) {
            \Log::error('Certificate generation failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Add text to image using Intervention Image
     *
     * @param \Intervention\Image\Image $image
     * @param string $text
     * @param int $x
     * @param int $y
     * @param int $fontSize
     * @param string $color
     * @param string $align
     */
    protected function addTextToImage($image, $text, $x, $y, $fontSize, $color, $align = 'center')
    {
        // Default font path (you can change this to custom font)
        $fontPath = public_path('fonts/Arial.ttf');

        // Use default font if custom font not found
        if (!file_exists($fontPath)) {
            $fontPath = null; // Will use GD default font
        }

        $image->text($text, $x, $y, function($font) use ($fontSize, $color, $align, $fontPath) {
            $font->size($fontSize);
            $font->color($color);
            $font->align($align);
            $font->valign('middle');

            if ($fontPath) {
                $font->file($fontPath);
            }
        });
    }

    /**
     * Generate unique certificate number
     *
     * @param int $eventId
     * @param int $participantId
     * @return string
     */
    protected function generateCertificateNumber($eventId, $participantId)
    {
        $timestamp = now()->format('YmdHis');
        return "CERT-{$eventId}-{$participantId}-{$timestamp}";
    }

    /**
     * Get certificate download URL
     *
     * @param Certificate $certificate
     * @return string|null
     */
    public function getCertificateDownloadUrl($certificate)
    {
        if (!$certificate->isReadyToDownload()) {
            return null;
        }

        return route('api.certificates.download', ['certificate' => $certificate->id]);
    }

    /**
     * Mark certificate as downloaded and increment download count
     *
     * @param Certificate $certificate
     */
    public function markAsDownloaded($certificate)
    {
        $certificate->markAsDownloaded();
    }
}
