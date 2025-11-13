<?php

namespace App\Exports;

use App\Models\User;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class UsersExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    public function collection()
    {
        return User::all();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Nama Lengkap',
            'Email',
            'Nomor Telepon',
            'Alamat',
            'Pendidikan',
            'Status',
            'Verifikasi Email',
            'Role Admin',
            'Tanggal Bergabung',
            'Terakhir Login'
        ];
    }

    public function map($user): array
    {
        return [
            $user->id,
            $user->name,
            $user->email,
            $user->phone ?? '-',
            $user->address ?? '-',
            $user->education ?? '-',
            ucfirst($user->status ?? 'active'),
            $user->is_verified ? 'Terverifikasi' : 'Belum Terverifikasi',
            $user->is_admin ? 'Ya' : 'Tidak',
            $user->created_at ? $user->created_at->format('d/m/Y H:i') : '-',
            $user->last_login_at ? $user->last_login_at->format('d/m/Y H:i') : '-'
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'FFF3E0']
                ]
            ]
        ];
    }
}
