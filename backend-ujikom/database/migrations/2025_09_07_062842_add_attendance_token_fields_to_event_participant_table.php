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
        Schema::table('event_participant', function (Blueprint $table) {
            // Update attendance_token to be 10 digits and unique
            $table->string('attendance_token', 10)->unique()->nullable()->change();
            
            // Add token generation timestamp
            $table->timestamp('token_generated_at')->nullable();
            
            // Add token expiry (optional, for security)
            $table->timestamp('token_expires_at')->nullable();
            
            // Add attendance status
            $table->enum('attendance_status', ['pending', 'present', 'absent'])->default('pending');
            
            // Add attendance verification method
            $table->string('verification_method')->nullable(); // token, manual, qr_code
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('event_participant', function (Blueprint $table) {
            $table->dropColumn([
                'token_generated_at',
                'token_expires_at', 
                'attendance_status',
                'verification_method'
            ]);
            
            // Revert attendance_token to original
            $table->string('attendance_token')->nullable()->change();
        });
    }
};