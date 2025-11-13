<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class VerificationEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $verificationUrl;

    public function __construct(User $user)
    {
        $this->user = $user;
        $this->verificationUrl = url('/api/email/verify/' . $user->id . '/' . sha1($user->getEmailForVerification()));
    }

    public function build()
    {
        return $this->subject('Verifikasi Email Anda')
                    ->markdown('emails.verification');
    }
}
