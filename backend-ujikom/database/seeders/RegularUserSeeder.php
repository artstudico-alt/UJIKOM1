<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RegularUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create regular users (unverified)
        $users = [
            [
                'name' => 'John Doe',
                'email' => 'john.doe@example.com',
                'password' => Hash::make('password123'),
                'phone' => '08123456789',
                'address' => 'Jl. Contoh No. 1',
                'education' => 'S1 Ekonomi',
                'role' => 'user',
                'is_admin' => false,
                'is_verified' => false, // Belum terverifikasi
                'status' => 'active',
            ],
            [
                'name' => 'Jane Smith',
                'email' => 'jane.smith@example.com',
                'password' => Hash::make('password123'),
                'phone' => '08123456790',
                'address' => 'Jl. Contoh No. 2',
                'education' => 'S1 Hukum',
                'role' => 'user',
                'is_admin' => false,
                'is_verified' => false, // Belum terverifikasi
                'status' => 'active',
            ],
            [
                'name' => 'Bob Wilson',
                'email' => 'bob.wilson@example.com',
                'password' => Hash::make('password123'),
                'phone' => '08123456791',
                'address' => 'Jl. Contoh No. 3',
                'education' => 'S1 Teknik',
                'role' => 'user',
                'is_admin' => false,
                'is_verified' => false, // Belum terverifikasi
                'status' => 'active',
            ],
        ];

        foreach ($users as $userData) {
            User::create($userData);
        }

        $this->command->info('Regular users created successfully!');
        $this->command->info('All users are unverified by default');
    }
}
