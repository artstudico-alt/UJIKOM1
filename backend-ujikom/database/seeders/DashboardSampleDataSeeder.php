<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\Attendance;
use App\Models\Certificate;
use Carbon\Carbon;

class DashboardSampleDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get existing users or create sample users
        $users = User::all();
        if ($users->count() < 10) {
            for ($i = 1; $i <= 20; $i++) {
                $email = "user{$i}@example.com";
                if (!User::where('email', $email)->exists()) {
                    User::create([
                        'name' => "User {$i}",
                        'email' => $email,
                        'password' => bcrypt('password123'),
                        'phone' => '08123456789' . str_pad($i, 1, '0', STR_PAD_LEFT),
                        'address' => "Address {$i}",
                        'education' => 'S1',
                        'email_verified_at' => now()
                    ]);
                }
            }
            $users = User::all();
        }

        // Get existing events or create new ones
        $events = Event::all();
        if ($events->isEmpty()) {
            // Create sample events for different months
            $events = collect([
                Event::create([
                    'title' => 'Workshop Laravel',
                    'description' => 'Workshop pengembangan aplikasi web dengan Laravel',
                    'date' => Carbon::now()->subMonths(2)->format('Y-m-d'),
                    'time' => '09:00:00',
                    'location' => 'Jakarta',
                    'max_participants' => 50,
                    'is_active' => true,
                    'created_by' => 1
                ]),
                Event::create([
                    'title' => 'Seminar React',
                    'description' => 'Seminar tentang React.js untuk frontend development',
                    'date' => Carbon::now()->subMonth()->format('Y-m-d'),
                    'time' => '10:00:00',
                    'location' => 'Bandung',
                    'max_participants' => 30,
                    'is_active' => true,
                    'created_by' => 1
                ]),
                Event::create([
                    'title' => 'Training Vue.js',
                    'description' => 'Training Vue.js untuk pemula',
                    'date' => Carbon::now()->format('Y-m-d'),
                    'time' => '14:00:00',
                    'location' => 'Surabaya',
                    'max_participants' => 25,
                    'is_active' => true,
                    'created_by' => 1
                ]),
                Event::create([
                    'title' => 'Conference AI',
                    'description' => 'Konferensi tentang Artificial Intelligence',
                    'date' => Carbon::now()->addMonth()->format('Y-m-d'),
                    'time' => '09:00:00',
                    'location' => 'Yogyakarta',
                    'max_participants' => 100,
                    'is_active' => true,
                    'created_by' => 1
                ])
            ]);
        }

        // Create event participants and attendances
        foreach ($events as $event) {
            // Random number of participants (5-15 per event)
            $participantCount = rand(5, 15);
            $selectedUsers = collect($users)->random($participantCount);

            foreach ($selectedUsers as $user) {
                // Create event participant
                $participant = EventParticipant::create([
                    'event_id' => $event->id,
                    'participant_id' => $user->id,
                    'registration_number' => 'REG' . str_pad(rand(1000, 9999), 4, '0', STR_PAD_LEFT),
                    'attendance_token' => str_pad(rand(0, 9999999999), 10, '0', STR_PAD_LEFT),
                    'token_generated_at' => now(),
                    'token_expires_at' => now()->addDay(),
                    'attendance_status' => 'pending',
                    'verification_method' => 'token'
                ]);

                // 80% chance of attendance
                if (rand(1, 100) <= 80) {
                    // Mark as attended
                    $participant->update([
                        'attendance_verified_at' => $event->date,
                        'attendance_status' => 'present'
                    ]);

                    // Create attendance record
                    Attendance::create([
                        'event_id' => $event->id,
                        'participant_id' => $user->id,
                        'event_participant_id' => $participant->id,
                        'time_in' => $event->date . ' ' . $event->time,
                        'ip_address' => '127.0.0.1',
                        'user_agent' => 'Seeder',
                        'notes' => 'Generated by seeder'
                    ]);

                    // 70% chance of certificate
                    if (rand(1, 100) <= 70) {
                        Certificate::create([
                            'event_id' => $event->id,
                            'participant_id' => $user->id,
                            'event_participant_id' => $participant->id,
                            'certificate_number' => 'CERT-' . str_pad($participant->id, 6, '0', STR_PAD_LEFT),
                            'issued_at' => $event->date,
                            'certificate_path' => 'certificates/cert_' . $participant->id . '.pdf'
                        ]);
                    }
                }
            }
        }

        $this->command->info('Dashboard sample data created successfully!');
        $this->command->info('Events: ' . Event::count());
        $this->command->info('Participants: ' . EventParticipant::count());
        $this->command->info('Attendances: ' . Attendance::count());
        $this->command->info('Certificates: ' . Certificate::count());
    }
}
