<?php

namespace App\Exports;

use App\Models\Event;
use App\Models\EventParticipant;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;

class EventParticipantsExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize, WithTitle
{
    protected $event;

    public function __construct(Event $event)
    {
        $this->event = $event;
    }

    public function query()
    {
        return EventParticipant::with('participant')
            ->where('event_id', $this->event->id)
            ->orderBy('created_at', 'desc');
    }

    public function headings(): array
    {
        return [
            'Registration Number',
            'Name',
            'Email',
            'Phone',
            'Institution',
            'Registration Date',
            'Attendance Status',
            'Attendance Time',
            'Certificate Status',
        ];
    }

    public function map($participant): array
    {
        return [
            $participant->registration_number,
            $participant->participant->name,
            $participant->participant->email,
            $participant->participant->phone,
            $participant->participant->institution,
            $participant->created_at->format('Y-m-d H:i'),
            $participant->attendance_verified_at ? 'Present' : 'Absent',
            $participant->attendance_verified_at ? $participant->attendance_verified_at->format('Y-m-d H:i') : 'N/A',
            $participant->has_received_certificate ? 'Issued' : 'Not Issued',
        ];
    }

    public function title(): string
    {
        return 'Event Participants';
    }
}
