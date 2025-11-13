<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class OrganizerUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (!User::where('email', 'organizer@example.com')->exists()) {
            User::create([
                'name' => 'Event Organizer',
                'email' => 'organizer@example.com',
                'password' => bcrypt('password123'),
                'phone' => '081234567891',
                'address' => 'Jakarta',
                'education' => 'S1',
                'email_verified_at' => now(),
                'role' => 'event_organizer',
                'is_verified' => true,
                'status' => 'active'
            ]);
            $this->command->info('Organizer user created: organizer@example.com');
        } else {
            $this->command->info('Organizer user already exists');
        }
    }
}
