# Setup Notifikasi Sistem

## Overview
Sistem notifikasi telah diimplementasikan untuk memberikan notifikasi otomatis kepada pengguna tentang:
- Event baru yang tersedia
- Pengingat event yang akan dimulai besok
- Notifikasi saat daftar hadir dimulai
- Notifikasi saat event selesai

## Backend Setup

### 1. Migration
Migration untuk tabel notifications sudah dibuat dan dijalankan:
```bash
php artisan migrate
```

### 2. Model dan Controller
- `app/Models/Notification.php` - Model untuk notifikasi
- `app/Http/Controllers/Api/NotificationController.php` - Controller API
- `app/Services/NotificationService.php` - Service untuk logika notifikasi

### 3. Routes API
Routes notifikasi sudah ditambahkan di `routes/api.php`:
- `GET /notifications` - Daftar notifikasi
- `GET /notifications/unread-count` - Jumlah notifikasi belum dibaca
- `GET /notifications/recent` - Notifikasi terbaru
- `GET /notifications/statistics` - Statistik notifikasi
- `PUT /notifications/{id}/read` - Tandai sebagai dibaca
- `PUT /notifications/{id}/unread` - Tandai sebagai belum dibaca
- `PUT /notifications/mark-all-read` - Tandai semua sebagai dibaca
- `DELETE /notifications/{id}` - Hapus notifikasi

### 4. Commands
Dua command telah dibuat:
- `notifications:process` - Memproses notifikasi yang terjadwal
- `notifications:schedule` - Menjadwalkan notifikasi baru

### 5. Scheduler
Scheduler Laravel telah dikonfigurasi untuk menjalankan:
- `notifications:process` setiap jam
- `notifications:schedule` setiap 6 jam

## Frontend Setup

### 1. Komponen Notifikasi
- `frontend/src/components/notifications/NotificationBell.tsx` - Bell icon dengan badge
- `frontend/src/components/notifications/NotificationList.tsx` - Daftar notifikasi
- `frontend/src/components/notifications/NotificationCenter.tsx` - Komponen utama
- `frontend/src/pages/Notifications.tsx` - Halaman notifikasi lengkap
- `frontend/src/hooks/useNotifications.ts` - Hook untuk mengelola notifikasi

### 2. Integrasi Layout
Notifikasi sudah terintegrasi di `MainLayout.tsx` dan route `/notifications` sudah ditambahkan.

## Cara Menjalankan

### 1. Manual Testing
```bash
# Jalankan command notifikasi secara manual
php artisan notifications:process
php artisan notifications:schedule
```

### 2. Scheduler (Production)
Untuk menjalankan scheduler di production, tambahkan ke crontab:
```bash
* * * * * cd /path/to/your/project && php artisan schedule:run >> /dev/null 2>&1
```

### 3. Development
Untuk development, jalankan scheduler secara manual:
```bash
php artisan schedule:work
```

## Jenis Notifikasi

### 1. Event Baru (`new_event`)
- Dikirim saat event baru dibuat
- Dikirim ke semua user yang terverifikasi
- Otomatis dipicu di `EventController@store`

### 2. Pengingat Event (`event_reminder`)
- Dikirim 1 hari sebelum event
- Dikirim ke peserta yang terdaftar
- Diproses oleh scheduler

### 3. Daftar Hadir Dimulai (`attendance_started`)
- Dikirim saat event dimulai (berdasarkan start_time)
- Dikirim ke peserta yang terdaftar
- Diproses oleh scheduler

### 4. Event Selesai (`event_completed`)
- Dikirim saat event selesai (berdasarkan end_time)
- Dikirim ke peserta yang terdaftar
- Diproses oleh scheduler

## Konfigurasi

### 1. Interval Polling Frontend
Notifikasi frontend melakukan polling setiap 30 detik untuk update real-time.

### 2. Scheduler Interval
- Process notifications: Setiap jam
- Schedule notifications: Setiap 6 jam

### 3. Database
Tabel `notifications` dengan kolom:
- `user_id` - ID user penerima
- `event_id` - ID event (nullable)
- `type` - Jenis notifikasi
- `title` - Judul notifikasi
- `message` - Pesan notifikasi
- `data` - Data tambahan (JSON)
- `is_read` - Status dibaca
- `scheduled_at` - Waktu terjadwal

## Testing

### 1. Test Notifikasi Event Baru
1. Buat event baru melalui API
2. Cek tabel notifications untuk notifikasi `new_event`

### 2. Test Notifikasi Pengingat
1. Buat event dengan tanggal besok
2. Jalankan `php artisan notifications:schedule`
3. Cek notifikasi `event_reminder`

### 3. Test Notifikasi Daftar Hadir
1. Buat event dengan start_time hari ini
2. Jalankan `php artisan notifications:process`
3. Cek notifikasi `attendance_started`

### 4. Test Notifikasi Event Selesai
1. Buat event dengan end_time yang sudah lewat
2. Jalankan `php artisan notifications:process`
3. Cek notifikasi `event_completed`

## Troubleshooting

### 1. Notifikasi Tidak Terkirim
- Cek log Laravel: `storage/logs/laravel.log`
- Pastikan scheduler berjalan
- Cek database untuk data event dan user

### 2. Frontend Tidak Update
- Cek network tab di browser
- Pastikan API endpoint dapat diakses
- Cek console untuk error JavaScript

### 3. Scheduler Tidak Berjalan
- Pastikan crontab dikonfigurasi dengan benar
- Test dengan `php artisan schedule:run`
- Cek log scheduler

## Monitoring

### 1. Log Monitoring
```bash
tail -f storage/logs/laravel.log | grep -i notification
```

### 2. Database Monitoring
```sql
-- Cek jumlah notifikasi per jenis
SELECT type, COUNT(*) as count FROM notifications GROUP BY type;

-- Cek notifikasi belum dibaca
SELECT COUNT(*) FROM notifications WHERE is_read = 0;

-- Cek notifikasi hari ini
SELECT COUNT(*) FROM notifications WHERE DATE(created_at) = CURDATE();
```

### 3. Performance Monitoring
- Monitor query performance untuk tabel notifications
- Cek memory usage saat processing notifikasi
- Monitor API response time untuk endpoint notifikasi
