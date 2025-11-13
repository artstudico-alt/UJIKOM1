<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EmailVerificationNotification extends Notification
{
    use Queueable;

    public $verificationCode;

    /**
     * Create a new notification instance.
     */
    public function __construct($verificationCode)
    {
        $this->verificationCode = $verificationCode;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Verifikasi Email Anda - ' . config('app.name'))
            ->greeting('Halo ' . $notifiable->name . '!')
            ->line('Terima kasih telah mendaftar di ' . config('app.name') . '.')
            ->line('Gunakan kode OTP berikut untuk memverifikasi alamat email Anda:')
            ->line('')
            ->line('**' . $this->verificationCode . '**')
            ->line('')
            ->line('Kode ini akan kedaluwarsa dalam 30 menit.')
            ->line('Jika Anda tidak meminta verifikasi email ini, Anda dapat mengabaikan pesan ini.')
            ->salutation('Salam,');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
