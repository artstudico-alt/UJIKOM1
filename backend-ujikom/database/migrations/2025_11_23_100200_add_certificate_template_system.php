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
        // Update events table for certificate template system
        Schema::table('events', function (Blueprint $table) {
            // Certificate template path (background image uploaded by EO)
            if (!Schema::hasColumn('events', 'certificate_template_path')) {
                $table->string('certificate_template_path')->nullable()->after('has_certificate');
            }

            // Certificate text settings (JSON) for text positioning and styling
            // Structure: {
            //   "participant_name": {"x": 400, "y": 350, "font_size": 32, "color": "#000000", "align": "center"},
            //   "event_title": {"x": 400, "y": 250, "font_size": 28, "color": "#000000", "align": "center"},
            //   "event_date": {"x": 400, "y": 450, "font_size": 24, "color": "#000000", "align": "center"},
            //   "certificate_number": {"x": 100, "y": 550, "font_size": 16, "color": "#666666", "align": "left"}
            // }
            $table->json('certificate_text_settings')->nullable()->after('certificate_template_path');

            // Auto-generate certificate when event completed
            $table->boolean('auto_generate_certificate')->default(true)->after('certificate_text_settings');

            // Timestamp when certificates were generated
            $table->timestamp('certificates_generated_at')->nullable()->after('auto_generate_certificate');
        });

        // Update certificates table for generated PDFs
        Schema::table('certificates', function (Blueprint $table) {
            // Participant and event info for certificate content
            if (!Schema::hasColumn('certificates', 'participant_name')) {
                $table->string('participant_name')->after('event_participant_id');
            }
            if (!Schema::hasColumn('certificates', 'event_title')) {
                $table->string('event_title')->after('participant_name');
            }
            if (!Schema::hasColumn('certificates', 'event_date')) {
                $table->date('event_date')->after('event_title');
            }

            // Generated PDF file path
            if (!Schema::hasColumn('certificates', 'file_path')) {
                $table->string('file_path')->nullable()->after('certificate_path');
            }
            if (!Schema::hasColumn('certificates', 'file_name')) {
                $table->string('file_name')->nullable()->after('file_path');
            }
            if (!Schema::hasColumn('certificates', 'file_size')) {
                $table->integer('file_size')->nullable()->after('file_name');
            }

            // Status: pending, generated, downloaded
            if (!Schema::hasColumn('certificates', 'status')) {
                $table->enum('status', ['pending', 'generated', 'downloaded'])->default('pending')->after('file_size');
            }

            // Generated timestamp
            if (!Schema::hasColumn('certificates', 'generated_at')) {
                $table->timestamp('generated_at')->nullable()->after('status');
            }

            // Downloaded timestamp
            if (!Schema::hasColumn('certificates', 'downloaded_at')) {
                $table->timestamp('downloaded_at')->nullable()->after('generated_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn([
                'certificate_template_path',
                'certificate_text_settings',
                'auto_generate_certificate',
                'certificates_generated_at'
            ]);
        });

        Schema::table('certificates', function (Blueprint $table) {
            $table->dropColumn([
                'participant_name',
                'event_title',
                'event_date',
                'file_path',
                'file_name',
                'file_size',
                'status',
                'generated_at',
                'downloaded_at'
            ]);
        });
    }
};
