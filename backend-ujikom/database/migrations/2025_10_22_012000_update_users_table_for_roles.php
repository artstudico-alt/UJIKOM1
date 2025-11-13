<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Step 1: Update existing users' roles based on the 'is_admin' flag.
        // Users with is_admin = true will have their role set to 'admin'.
        // Users with role = 'peserta' will have it updated to 'user'.
        DB::table('users')->where('is_admin', true)->update(['role' => 'admin']);
        DB::table('users')->where('role', 'peserta')->update(['role' => 'user']);

        // Step 2: Modify the 'role' column to be an ENUM with the new roles.
        // Set the default to 'user'.
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['admin', 'event_organizer', 'user'])->default('user')->change();
        });

        // Step 3: Drop the now-redundant 'is_admin' column.
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('is_admin');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // To reverse, we first add back the 'is_admin' column.
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_admin')->default(false)->after('verification_code_expires_at');
        });

        // Update 'is_admin' for users who have the 'admin' role.
        DB::table('users')->where('role', 'admin')->update(['is_admin' => true]);

        // Revert the 'role' column back to a string.
        // We'll also revert 'user' back to 'peserta' for consistency with the original state.
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('peserta')->change();
        });
        DB::table('users')->where('role', 'user')->update(['role' => 'peserta']);
    }
};
