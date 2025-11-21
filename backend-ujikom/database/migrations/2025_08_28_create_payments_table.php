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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('event_id')->nullable()->constrained()->onDelete('cascade'); // Nullable for account upgrade payments

            // Invoice & Transaction Info
            $table->string('invoice_number', 50)->unique();
            $table->decimal('amount', 15, 2);
            $table->string('payment_method', 50)->nullable(); // va, ewallet, qris, credit_card
            $table->string('payment_channel', 50)->nullable(); // bca, mandiri, ovo, dana, etc

            // Payment Status
            $table->enum('payment_status', ['pending', 'success', 'failed', 'expired'])->default('pending');

            // DOKU Response Data
            $table->string('doku_transaction_id', 100)->nullable();
            $table->string('doku_payment_code', 100)->nullable(); // VA number, QRIS code, etc
            $table->text('payment_url')->nullable(); // URL for payment page
            $table->text('qr_code_url')->nullable(); // URL for QRIS image

            // Additional Info
            $table->text('payment_instructions')->nullable(); // JSON format
            $table->timestamp('expired_at')->nullable();
            $table->timestamp('paid_at')->nullable();

            // Metadata
            $table->json('metadata')->nullable(); // Store additional DOKU response

            $table->timestamps();

            // Indexes
            $table->index('invoice_number');
            $table->index('payment_status');
            $table->index('doku_transaction_id');
            $table->index(['user_id', 'event_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
