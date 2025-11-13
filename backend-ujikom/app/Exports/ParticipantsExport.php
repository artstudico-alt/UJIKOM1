<?php

namespace App\Exports;

use App\Models\EventParticipant;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ParticipantsExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    public function collection()
    {
        return EventParticipant::with(['event', 'participant', 'attendance'])->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Nomor Registrasi',
            'Nama Peserta',
            'Email Peserta',
            'Judul Event',
            'Tanggal Event',
            'Status Kehadiran',
            'Token Kehadiran',
            'Tanggal Registrasi',
            'Tanggal Kehadiran',
            'Sertifikat Diterima'
        ];
    }

    public function map($participant): array
    {
        return [
            $participant->id,
            $participant->registration_number,
            $participant->participant ? $participant->participant->name : '-',
            $participant->participant ? $participant->participant->email : '-',
            $participant->event ? $participant->event->title : '-',
            $participant->event && $participant->event->event_date ? $participant->event->event_date->format('d/m/Y') : '-',
            $participant->attendance ? 'Hadir' : 'Belum Hadir',
            $participant->attendance_token ?? '-',
            $participant->created_at ? $participant->created_at->format('d/m/Y H:i') : '-',
            $participant->attendance ? $participant->attendance->created_at->format('d/m/Y H:i') : '-',
            $participant->certificate ? 'Ya' : 'Belum'
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'E8F5E8']
                ]
            ]
        ];
    }
}
