<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CheckAdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('email', 'admin@example.com')->first();
        
        if ($admin) {
            $this->command->info('Admin user found:');
            $this->command->info('ID: ' . $admin->id);
            $this->command->info('Name: ' . $admin->name);
            $this->command->info('Email: ' . $admin->email);
            $this->command->info('Status: ' . $admin->status);
            $this->command->info('Email verified: ' . ($admin->email_verified_at ? 'Yes' : 'No'));
            $this->command->info('Role: ' . $admin->role);
            
            // Update admin user to ensure it's properly configured
            $admin->update([
                'status' => 'active',
                'email_verified_at' => now(),
                'role' => 'admin',
                'password' => Hash::make('password123')
            ]);
            
            $this->command->info('Admin user updated successfully');
        } else {
            $this->command->info('Admin user not found, creating new one...');
            
            $admin = User::create([
                'name' => 'Admin',
                'email' => 'admin@example.com',
                'password' => Hash::make('password123'),
                'phone' => '081234567890',
                'address' => 'Jakarta',
                'education' => 'S2',
                'email_verified_at' => now(),
                'status' => 'active',
                'role' => 'admin'
            ]);
            
            $this->command->info('Admin user created successfully');
        }
    }
}
