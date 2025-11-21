<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'event_id',
        'invoice_number',
        'amount',
        'payment_method',
        'payment_channel',
        'payment_status',
        'doku_transaction_id',
        'doku_payment_code',
        'payment_url',
        'qr_code_url',
        'payment_instructions',
        'expired_at',
        'paid_at',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_instructions' => 'array',
        'metadata' => 'array',
        'expired_at' => 'datetime',
        'paid_at' => 'datetime',
    ];

    /**
     * Get the user that owns the payment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the event that the payment is for.
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Check if payment is pending.
     */
    public function isPending(): bool
    {
        return $this->payment_status === 'pending';
    }

    /**
     * Check if payment is successful.
     */
    public function isSuccess(): bool
    {
        return $this->payment_status === 'success';
    }

    /**
     * Check if payment is expired.
     */
    public function isExpired(): bool
    {
        return $this->payment_status === 'expired' ||
               ($this->expired_at && $this->expired_at->isPast());
    }

    /**
     * Mark payment as success.
     */
    public function markAsSuccess(): void
    {
        $this->update([
            'payment_status' => 'success',
            'paid_at' => now(),
        ]);
    }

    /**
     * Mark payment as failed.
     */
    public function markAsFailed(): void
    {
        $this->update([
            'payment_status' => 'failed',
        ]);
    }

    /**
     * Mark payment as expired.
     */
    public function markAsExpired(): void
    {
        $this->update([
            'payment_status' => 'expired',
        ]);
    }
}
