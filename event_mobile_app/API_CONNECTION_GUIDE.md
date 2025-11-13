# 📱 Panduan Koneksi API Flutter ke Laravel Backend

## ✅ Status Backend
- **Backend berjalan di:** `http://172.16.2.54:8000`
- **API Endpoint:** `http://172.16.2.54:8000/api`
- **Status:** ✅ ONLINE dan TESTED

## 🔧 Konfigurasi yang Sudah Benar

### 1. Backend Laravel (Sudah Dikonfigurasi ✅)
```bash
# Backend berjalan di:
php artisan serve --host=0.0.0.0 --port=8000

# Listening on: 0.0.0.0:8000
# Accessible via: 172.16.2.54:8000
```

### 2. Flutter API Service
File: `lib/services/api_service.dart`
```dart
static const String baseUrl = 'http://172.16.2.54:8000/api';
```

## 🧪 Test API yang Sudah Berhasil

### Test 1: Get Events
```bash
curl http://172.16.2.54:8000/api/events
```
**Response:**
```json
{
  "status": "success",
  "data": [...]
}
```

### Test 2: Login
```bash
curl -X POST http://172.16.2.54:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"2sc00nd@gmail.com","password":"password123"}'
```
**Response:**
```json
{
  "status": "success",
  "message": "Login berhasil",
  "data": {
    "user": {...},
    "token": "..."
  }
}
```

## 🚨 Masalah yang Ditemukan dan Solusinya

### ❌ Masalah: Timeout saat Login
**Penyebab:**
1. Backend tidak berjalan di `0.0.0.0` (hanya di `127.0.0.1`)
2. Firewall Windows memblokir koneksi
3. Emulator tidak bisa akses IP host

**Solusi:**

#### Solusi 1: Jalankan Backend dengan Benar (✅ SUDAH DITERAPKAN)
```bash
php artisan serve --host=0.0.0.0 --port=8000
```

#### Solusi 2: Cek Firewall Windows
```powershell
# Buat rule firewall untuk port 8000
New-NetFirewallRule -DisplayName "Laravel Dev Server" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
```

#### Solusi 3: Alternatif - Gunakan 10.0.2.2 (Android Emulator Special IP)
Jika `172.16.2.54` tidak work, ganti di Flutter:
```dart
// Ganti di lib/services/api_service.dart
static const String baseUrl = 'http://10.0.2.2:8000/api';
```
**Catatan:** `10.0.2.2` adalah IP khusus Android emulator untuk akses localhost host machine.

## 📋 Checklist Koneksi API

### Backend Laravel
- [x] Backend berjalan di `0.0.0.0:8000`
- [x] CORS dikonfigurasi untuk menerima request dari mobile
- [x] API endpoint `/login` berfungsi
- [x] API endpoint `/events` berfungsi
- [x] Database terkoneksi dengan baik

### Flutter Mobile App
- [x] `baseUrl` di `api_service.dart` sudah benar
- [x] HTTP timeout dikonfigurasi (30 detik)
- [x] Error handling sudah lengkap
- [x] Event model sesuai dengan backend response

### Testing
- [x] API `/events` tested ✅
- [x] API `/login` tested ✅
- [ ] Test dari Flutter mobile app

## 🔍 Debugging Tips

### 1. Cek Backend Running
```bash
netstat -ano | findstr :8000
```
**Expected Output:**
```
TCP    0.0.0.0:8000           0.0.0.0:0              LISTENING       [PID]
```

### 2. Test API dari Command Line
```bash
# Windows PowerShell
Invoke-RestMethod -Uri "http://172.16.2.54:8000/api/events" -Method Get
```

### 3. Lihat Log Flutter
Di terminal Flutter, perhatikan output log:
```
I/flutter (xxxxx): Login error: [error message]
```

### 4. Cek IP Address
```bash
ipconfig
# Cari: IPv4 Address di adapter Wi-Fi
```

## 🎯 Langkah-Langkah Koneksi

### Step 1: Start Backend
```bash
cd C:\xampp\htdocs\Event-Umum\backend-ujikom
php artisan serve --host=0.0.0.0 --port=8000
```

### Step 2: Verify Backend
```bash
curl http://172.16.2.54:8000/api/events
```

### Step 3: Run Flutter App
```bash
cd C:\xampp\htdocs\Event-Umum\event_mobile_app
flutter run --hot
```

### Step 4: Test Login
- Email: `2sc00nd@gmail.com`
- Password: `password123`

## 📞 API Endpoints

### Public Endpoints (No Auth Required)
```
GET  /api/events              - List all events
GET  /api/events/{id}         - Get event detail
POST /api/login               - User login
POST /api/register            - User registration
POST /api/forgot-password     - Request password reset
```

### Protected Endpoints (Auth Required)
```
GET  /api/user                - Get user profile
POST /api/logout              - User logout
GET  /api/my-events           - User's registered events
POST /api/events/{id}/register - Register for event
```

## 🔐 Authentication Flow

1. **Login Request**
```dart
final response = await ApiService.login(email, password);
```

2. **Response**
```json
{
  "status": "success",
  "data": {
    "user": {...},
    "token": "xxx|yyy"
  }
}
```

3. **Store Token**
```dart
final token = response['data']['token'];
await prefs.setString('auth_token', token);
```

4. **Use Token in Subsequent Requests**
```dart
headers: {
  'Authorization': 'Bearer $token'
}
```

## 🐛 Common Errors & Solutions

### Error: "Request timeout"
**Solusi:**
- Pastikan backend running di `0.0.0.0:8000`
- Cek firewall tidak block port 8000
- Cek IP address benar

### Error: "Connection refused"
**Solusi:**
- Backend tidak running, start dengan: `php artisan serve --host=0.0.0.0 --port=8000`

### Error: "Email atau password salah"
**Solusi:**
- Cek credentials di database
- Default password seeder: `password123`

## 📊 Response Format dari Backend

### Success Response
```json
{
  "status": "success",
  "message": "...",
  "data": {...}
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error message",
  "errors": {...}
}
```

## ✅ Final Checklist

- [x] Backend Laravel berjalan di `0.0.0.0:8000`
- [x] API tested dan berfungsi
- [x] Flutter `baseUrl` sudah benar
- [x] Event model sudah disesuaikan
- [x] Timeout handling sudah ada
- [ ] Test login dari mobile app
- [ ] Test fetch events dari mobile app

## 🚀 Sekarang Coba Login!

1. Buka emulator Android
2. Run aplikasi Flutter
3. Login dengan:
   - Email: `2sc00nd@gmail.com`
   - Password: `password123`
4. Aplikasi akan fetch events dari database

**Backend sudah siap dan tested! Silakan coba login di mobile app sekarang!** 🎯

