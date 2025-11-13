import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Event } from '../services/eventService';

export interface ExportEvent {
  id: string | number;
  name: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  registrationDate: string;
  price: number;
  status: string;
  category: string;
  organizer: string;
  organizerEmail: string;
  organizerContact: string;
  createdAt: string;
  approvedAt?: string;
  submittedAt?: string;
}

/**
 * Convert Event to ExportEvent format
 */
export const convertEventToExportFormat = (event: Event): ExportEvent => {
  return {
    id: event.id,
    name: event.name || event.title || '',
    title: event.title || event.name || '',
    description: event.description || '',
    date: event.eventDate || event.date || '',
    startTime: event.startTime || '',
    endTime: event.endTime || '',
    location: event.location || '',
    maxParticipants: event.maxParticipants || 0,
    currentParticipants: event.currentParticipants || 0,
    registrationDate: event.registrationDate || '',
    price: event.price || 0,
    status: event.status || '',
    category: event.category || '',
    organizer: event.organizer || event.organizerName || '',
    organizerEmail: event.organizerEmail || '',
    organizerContact: event.organizerContact || '',
    createdAt: event.createdAt || '',
    approvedAt: event.approvedAt || '',
    submittedAt: event.submittedAt || ''
  };
};

/**
 * Export events to Excel file
 */
export const exportToExcel = (
  events: ExportEvent[], 
  filename: string,
  sheetName: string = 'Events'
): void => {
  try {
    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    
    // Convert data to worksheet format
    const worksheet = XLSX.utils.json_to_sheet(events, {
      header: [
        'id',
        'name', 
        'title',
        'description',
        'date',
        'startTime',
        'endTime', 
        'location',
        'maxParticipants',
        'currentParticipants',
        'registrationDate',
        'price',
        'status',
        'category',
        'organizer',
        'organizerEmail',
        'organizerContact',
        'createdAt',
        'approvedAt',
        'submittedAt'
      ]
    });

    // Set column headers in Indonesian
    const headers = {
      'A1': { v: 'ID Event' },
      'B1': { v: 'Nama Event' },
      'C1': { v: 'Judul Event' },
      'D1': { v: 'Deskripsi' },
      'E1': { v: 'Tanggal Event' },
      'F1': { v: 'Waktu Mulai' },
      'G1': { v: 'Waktu Selesai' },
      'H1': { v: 'Lokasi' },
      'I1': { v: 'Maksimal Peserta' },
      'J1': { v: 'Peserta Terdaftar' },
      'K1': { v: 'Batas Registrasi' },
      'L1': { v: 'Harga Tiket' },
      'M1': { v: 'Status Event' },
      'N1': { v: 'Kategori' },
      'O1': { v: 'Organizer' },
      'P1': { v: 'Email Organizer' },
      'Q1': { v: 'Kontak Organizer' },
      'R1': { v: 'Tanggal Dibuat' },
      'S1': { v: 'Tanggal Disetujui' },
      'T1': { v: 'Tanggal Disubmit' }
    };

    // Apply headers
    Object.keys(headers).forEach(cell => {
      if (worksheet[cell]) {
        worksheet[cell].v = headers[cell as keyof typeof headers].v;
      }
    });

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array' 
    });

    // Save file
    const data = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    saveAs(data, `${filename}.xlsx`);
    
    console.log(`✅ Excel file exported: ${filename}.xlsx`);
  } catch (error) {
    console.error('❌ Error exporting to Excel:', error);
    throw new Error('Gagal mengekspor file Excel');
  }
};

/**
 * Export events to CSV file
 */
export const exportToCSV = (
  events: ExportEvent[], 
  filename: string
): void => {
  try {
    // Create CSV headers in Indonesian
    const headers = [
      'ID Event',
      'Nama Event', 
      'Judul Event',
      'Deskripsi',
      'Tanggal Event',
      'Waktu Mulai',
      'Waktu Selesai',
      'Lokasi',
      'Maksimal Peserta',
      'Peserta Terdaftar',
      'Batas Registrasi',
      'Harga Tiket',
      'Status Event',
      'Kategori',
      'Organizer',
      'Email Organizer',
      'Kontak Organizer',
      'Tanggal Dibuat',
      'Tanggal Disetujui',
      'Tanggal Disubmit'
    ];

    // Convert events to CSV rows
    const csvRows = events.map(event => [
      event.id,
      `"${event.name}"`,
      `"${event.title}"`,
      `"${event.description}"`,
      event.date,
      event.startTime,
      event.endTime,
      `"${event.location}"`,
      event.maxParticipants,
      event.currentParticipants,
      event.registrationDate,
      event.price,
      event.status,
      event.category,
      `"${event.organizer}"`,
      event.organizerEmail,
      event.organizerContact,
      event.createdAt,
      event.approvedAt || '',
      event.submittedAt || ''
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');

    // Create and save CSV file
    const blob = new Blob([csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    
    saveAs(blob, `${filename}.csv`);
    
    console.log(`✅ CSV file exported: ${filename}.csv`);
  } catch (error) {
    console.error('❌ Error exporting to CSV:', error);
    throw new Error('Gagal mengekspor file CSV');
  }
};

/**
 * Get formatted filename with timestamp
 */
export const getFormattedFilename = (prefix: string): string => {
  const now = new Date();
  const timestamp = now.toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .substring(0, 19);
  
  return `${prefix}_${timestamp}`;
};

/**
 * Format event status to Indonesian
 */
export const formatEventStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'pending_approval': 'Menunggu Persetujuan',
    'published': 'Dipublikasikan',
    'ongoing': 'Sedang Berlangsung',
    'completed': 'Selesai',
    'cancelled': 'Dibatalkan',
    'draft': 'Draft',
    'rejected': 'Ditolak'
  };
  
  return statusMap[status] || status;
};

/**
 * Calculate event statistics for reports
 */
export const calculateEventStats = (events: Event[]) => {
  const totalEvents = events.length;
  const totalParticipants = events.reduce((sum, event) => 
    sum + (event.currentParticipants || 0), 0
  );
  const totalRevenue = events.reduce((sum, event) => 
    sum + ((event.price || 0) * (event.currentParticipants || 0)), 0
  );
  
  const statusCounts = events.reduce((counts, event) => {
    const status = event.status || 'draft';
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
  
  const categoryCounts = events.reduce((counts, event) => {
    const category = event.category || 'Lainnya';
    counts[category] = (counts[category] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
  
  return {
    totalEvents,
    totalParticipants,
    totalRevenue,
    statusCounts,
    categoryCounts,
    publishedEvents: statusCounts['published'] || 0,
    pendingEvents: statusCounts['pending_approval'] || 0,
    completedEvents: statusCounts['completed'] || 0
  };
};
