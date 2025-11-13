<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;
use App\Models\Certificate;
use App\Models\Event;
use App\Models\User;

class CertificateGenerated extends Mailable
{
    use Queueable, SerializesModels;

    public $certificate;
    public $event;
    public $participant;

    /**
     * Create a new message instance.
     */
    public function __construct(Certificate $certificate, Event $event, User $participant)
    {
        $this->certificate = $certificate;
        $this->event = $event;
        $this->participant = $participant;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Sertifikat Event: {$this->event->title}",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.certificate-generated',
            with: [
                'certificate' => $this->certificate,
                'event' => $this->event,
                'participant' => $this->participant,
            ]
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        return [
            Attachment::fromPath(storage_path('app/public/' . str_replace('/storage/', '', $this->certificate->certificate_path)))
                ->as("Sertifikat_{$this->event->title}_{$this->participant->name}.pdf")
                ->withMime('application/pdf'),
        ];
    }
}
