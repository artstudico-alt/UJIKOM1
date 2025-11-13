<?php

namespace App\Exports;

use App\Models\Event;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class EventsExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    public function collection()
    {
        return Event::with(['creator'])->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Judul Event',
            'Deskripsi',
            'Tanggal Event',
            'Waktu Mulai',
            'Waktu Selesai',
            'Lokasi',
            'Status',
            'Maksimal Peserta',
            'Peserta Saat Ini',
            'Deadline Registrasi',
            'Dibuat Oleh',
            'Tanggal Dibuat',
            'Tanggal Diupdate'
        ];
    }

    public function map($event): array
    {
        return [
            $event->id,
            $event->title,
            $event->description,
            $event->event_date ? $event->event_date->format('d/m/Y') : '-',
            $event->start_time ? $event->start_time->format('H:i') : '-',
            $event->end_time ? $event->end_time->format('H:i') : '-',
            $event->location,
            ucfirst($event->status),
            $event->max_participants ?? '-',
            $event->current_participants_count ?? 0,
            $event->registration_deadline ? $event->registration_deadline->format('d/m/Y H:i') : '-',
            $event->creator ? $event->creator->name : '-',
            $event->created_at ? $event->created_at->format('d/m/Y H:i') : '-',
            $event->updated_at ? $event->updated_at->format('d/m/Y H:i') : '-'
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'E3F2FD']
                ]
            ]
        ];
    }
}
