<?php

namespace App\Exports;

use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\Attendance;
use App\Models\Certificate;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardExport implements WithMultipleSheets
{
    protected $year;

    public function __construct($year = null)
    {
        $this->year = $year ?? now()->year;
    }

    public function sheets(): array
    {
        return [
            'Events Summary' => new EventsSummarySheet($this->year),
            'Monthly Statistics' => new MonthlyStatisticsSheet($this->year),
            'Top Events' => new TopEventsSheet($this->year),
            'Participants Data' => new ParticipantsDataSheet($this->year),
        ];
    }
}

class EventsSummarySheet implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithTitle
{
    protected $year;

    public function __construct($year)
    {
        $this->year = $year;
    }

    public function collection()
    {
        return collect([
            (object) [
                'total_events' => Event::whereYear('date', $this->year)->count(),
                'total_participants' => EventParticipant::whereHas('event', function($query) {
                    $query->whereYear('date', $this->year);
                })->count(),
                'total_attendances' => Attendance::whereHas('event', function($query) {
                    $query->whereYear('date', $this->year);
                })->count(),
                'total_certificates' => Certificate::whereHas('event', function($query) {
                    $query->whereYear('date', $this->year);
                })->count(),
                'upcoming_events' => Event::where('date', '>=', now()->toDateString())
                    ->where('date', '<=', now()->addDays(30)->toDateString())
                    ->count(),
            ]
        ]);
    }

    public function headings(): array
    {
        return [
            'Total Events',
            'Total Participants',
            'Total Attendances',
            'Total Certificates',
            'Upcoming Events (30 days)',
        ];
    }

    public function map($row): array
    {
        return [
            $row->total_events,
            $row->total_participants,
            $row->total_attendances,
            $row->total_certificates,
            $row->upcoming_events,
        ];
    }

    public function title(): string
    {
        return 'Events Summary';
    }
}

class MonthlyStatisticsSheet implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithTitle
{
    protected $year;

    public function __construct($year)
    {
        $this->year = $year;
    }

    public function collection()
    {
        $months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        $data = collect();

        foreach ($months as $index => $month) {
            $monthNumber = $index + 1;
            
            $eventsCount = Event::whereYear('date', $this->year)
                ->whereMonth('date', $monthNumber)
                ->count();

            $participantsCount = EventParticipant::whereHas('event', function($query) use ($monthNumber) {
                $query->whereYear('date', $this->year)
                      ->whereMonth('date', $monthNumber);
            })->count();

            $attendancesCount = Attendance::whereHas('event', function($query) use ($monthNumber) {
                $query->whereYear('date', $this->year)
                      ->whereMonth('date', $monthNumber);
            })->count();

            $data->push((object) [
                'month' => $month,
                'events' => $eventsCount,
                'participants' => $participantsCount,
                'attendances' => $attendancesCount,
            ]);
        }

        return $data;
    }

    public function headings(): array
    {
        return [
            'Month',
            'Events Count',
            'Participants Count',
            'Attendances Count',
        ];
    }

    public function map($row): array
    {
        return [
            $row->month,
            $row->events,
            $row->participants,
            $row->attendances,
        ];
    }

    public function title(): string
    {
        return 'Monthly Statistics';
    }
}

class TopEventsSheet implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithTitle
{
    protected $year;

    public function __construct($year)
    {
        $this->year = $year;
    }

    public function collection()
    {
        return Event::withCount('eventParticipants')
            ->whereYear('date', $this->year)
            ->orderBy('event_participants_count', 'desc')
            ->take(10)
            ->get();
    }

    public function headings(): array
    {
        return [
            'Event Title',
            'Date',
            'Location',
            'Participants Count',
            'Attendances Count',
            'Certificates Issued',
        ];
    }

    public function map($event): array
    {
        $attendancesCount = Attendance::where('event_id', $event->id)->count();
        $certificatesCount = Certificate::where('event_id', $event->id)->count();

        return [
            $event->title,
            $event->date->format('Y-m-d'),
            $event->location,
            $event->event_participants_count,
            $attendancesCount,
            $certificatesCount,
        ];
    }

    public function title(): string
    {
        return 'Top 10 Events';
    }
}

class ParticipantsDataSheet implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithTitle
{
    protected $year;

    public function __construct($year)
    {
        $this->year = $year;
    }

    public function collection()
    {
        return EventParticipant::with(['participant', 'event'])
            ->whereHas('event', function($query) {
                $query->whereYear('date', $this->year);
            })
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function headings(): array
    {
        return [
            'Registration Number',
            'Participant Name',
            'Email',
            'Phone',
            'Event Title',
            'Event Date',
            'Registration Date',
            'Attendance Status',
            'Attendance Time',
            'Certificate Status',
        ];
    }

    public function map($participant): array
    {
        $attendance = Attendance::where('event_id', $participant->event_id)
            ->where('user_id', $participant->participant_id)
            ->first();

        $certificate = Certificate::where('event_id', $participant->event_id)
            ->where('user_id', $participant->participant_id)
            ->first();

        return [
            $participant->registration_number,
            $participant->participant->name,
            $participant->participant->email,
            $participant->participant->phone,
            $participant->event->title,
            $participant->event->date->format('Y-m-d'),
            $participant->created_at->format('Y-m-d H:i'),
            $attendance ? 'Present' : 'Absent',
            $attendance ? $attendance->created_at->format('Y-m-d H:i') : 'N/A',
            $certificate ? 'Issued' : 'Not Issued',
        ];
    }

    public function title(): string
    {
        return 'Participants Data';
    }
}
