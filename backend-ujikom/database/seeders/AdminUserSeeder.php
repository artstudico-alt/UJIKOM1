<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (!User::where('email', 'admin@example.com')->exists()) {
            User::create([
                'name' => 'Admin',
                'email' => 'admin@example.com',
                'password' => bcrypt('password123'),
                'phone' => '081234567890',
                'address' => 'Jakarta',
                'education' => 'S2',
                'email_verified_at' => now(),
                'role' => 'admin'
            ]);
            $this->command->info('Admin user created: admin@example.com');
        } else {
            $this->command->info('Admin user already exists');
        }
    }
}