<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class FixAdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('email', 'admin@example.com')->first();
        
        if ($admin) {
            $admin->update([
                'status' => 'active',
                'email_verified_at' => now(),
                'role' => 'admin'
            ]);
            $this->command->info('Admin user updated successfully');
        } else {
            $this->command->info('Admin user not found');
        }
    }
}
