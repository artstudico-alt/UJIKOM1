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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->string('role')->default('peserta');
            $table->string('status')->default('active');
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->string('education')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->string('verification_code')->nullable();
            $table->timestamp('verification_code_expires_at')->nullable();
            $table->integer('verification_attempts')->default(0);
            $table->timestamp('last_verification_attempt')->nullable();
            $table->boolean('is_admin')->default(false);
            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
