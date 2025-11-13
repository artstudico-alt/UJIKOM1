<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Event;
use App\Models\User;
use App\Models\EventParticipant;
use App\Models\Certificate;
use Illuminate\Support\Facades\Storage;

class CertificateSampleDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Update some events to have certificates
        $events = Event::take(5)->get();
        
        foreach ($events as $index => $event) {
            $event->update([
                'has_certificate' => true,
                'certificate_required' => $index % 2 === 0, // Half are required, half are optional
            ]);
        }

        // Create sample certificates for events that have participants with attendance
        $eventsWithCertificates = Event::where('has_certificate', true)->get();
        
        foreach ($eventsWithCertificates as $event) {
            // Get participants who have attended
            $participants = EventParticipant::where('event_id', $event->id)
                ->where('attendance_verified_at', '!=', null)
                ->with('participant')
                ->take(3) // Create certificates for first 3 participants
                ->get();

            foreach ($participants as $participant) {
                // Check if certificate already exists
                $existingCertificate = Certificate::where('event_id', $event->id)
                    ->where('participant_id', $participant->participant_id)
                    ->first();

                if (!$existingCertificate) {
                    Certificate::create([
                        'event_id' => $event->id,
                        'participant_id' => $participant->participant_id,
                        'event_participant_id' => $participant->id,
                        'certificate_number' => 'CERT-' . strtoupper(substr(md5($event->id . $participant->id . time()), 0, 8)),
                        'certificate_path' => '/storage/certificates/sample_certificate.pdf',
                        'issued_at' => now()->subDays(rand(1, 30)),
                        'download_count' => rand(0, 5),
                    ]);

                    // Update participant's certificate status
                    $participant->update(['has_received_certificate' => true]);
                }
            }
        }

        $this->command->info('Certificate sample data created successfully!');
        $this->command->info('Events with certificates: ' . Event::where('has_certificate', true)->count());
        $this->command->info('Total certificates: ' . Certificate::count());
    }
}