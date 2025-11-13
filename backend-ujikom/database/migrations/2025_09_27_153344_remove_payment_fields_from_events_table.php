<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            // Remove payment-related fields
            $table->dropColumn([
                'is_paid_event',
                'ticket_price',
                'ticket_types',
                'early_bird_enabled',
                'early_bird_discount',
                'early_bird_deadline',
                'max_tickets_per_user',
                'requires_approval',
                'payment_instructions',
                'currency',
                'available_payment_methods',
                'payment_expiry_hours',
                'auto_approve_payments',
                'allows_refund',
                'refund_deadline_hours',
                'refund_policy'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            // Re-add payment fields if needed to rollback
            $table->boolean('is_paid_event')->default(false);
            $table->decimal('ticket_price', 10, 2)->nullable();
            $table->json('ticket_types')->nullable();
            $table->boolean('early_bird_enabled')->default(false);
            $table->decimal('early_bird_discount', 5, 2)->nullable();
            $table->datetime('early_bird_deadline')->nullable();
            $table->integer('max_tickets_per_user')->nullable();
            $table->boolean('requires_approval')->default(false);
            $table->text('payment_instructions')->nullable();
            $table->string('currency', 3)->default('IDR');
            $table->json('available_payment_methods')->nullable();
            $table->integer('payment_expiry_hours')->default(24);
            $table->boolean('auto_approve_payments')->default(true);
            $table->boolean('allows_refund')->default(false);
            $table->integer('refund_deadline_hours')->nullable();
            $table->text('refund_policy')->nullable();
        });
    }
};
