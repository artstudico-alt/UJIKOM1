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
            // Organizer type: 'admin' or 'organizer'
            $table->enum('organizer_type', ['admin', 'organizer'])->default('admin')->after('user_id');
            
            // Event status for approval workflow
            $table->enum('status', ['draft', 'pending_approval', 'approved', 'published', 'rejected', 'cancelled'])
                  ->default('published')->after('organizer_type');
            
            // Organizer information (for public display)
            $table->string('organizer_name')->nullable()->after('status');
            $table->string('organizer_email')->nullable()->after('organizer_name');
            $table->string('organizer_contact')->nullable()->after('organizer_email');
            
            // Additional organizer fields
            $table->string('category')->nullable()->after('organizer_contact');
            $table->decimal('price', 10, 2)->default(0)->after('category');
            $table->timestamp('registration_date')->nullable()->after('price');
            
            // Approval tracking
            $table->timestamp('submitted_at')->nullable()->after('registration_date');
            $table->timestamp('approved_at')->nullable()->after('submitted_at');
            $table->timestamp('rejected_at')->nullable()->after('approved_at');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null')->after('rejected_at');
            $table->text('rejection_reason')->nullable()->after('approved_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn([
                'organizer_type',
                'status',
                'organizer_name',
                'organizer_email',
                'organizer_contact',
                'category',
                'price',
                'registration_date',
                'submitted_at',
                'approved_at',
                'rejected_at',
                'approved_by',
                'rejection_reason'
            ]);
        });
    }
};
