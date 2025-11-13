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
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('payments');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recreate payments table
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('event_id')->constrained()->onDelete('cascade');
            $table->string('payment_id')->unique();
            $table->string('external_id')->unique();
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('IDR');
            $table->string('status')->default('pending');
            $table->string('payment_method')->nullable();
            $table->string('payment_channel')->nullable();
            $table->json('payment_details')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->text('failure_reason')->nullable();
            $table->json('xendit_response')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'event_id']);
            $table->index(['status']);
            $table->index(['payment_id']);
        });

        // Recreate transactions table
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained()->onDelete('cascade');
            $table->string('transaction_type');
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('IDR');
            $table->string('status');
            $table->string('reference_id')->nullable();
            $table->text('description')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
        });
    }
};
