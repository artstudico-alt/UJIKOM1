# 📱 Panduan Halaman Mobile App

## ✅ HALAMAN YANG SUDAH DIBUAT

### 1. **Login Screen** (lib/screens/auth/login_screen.dart)
**Status:** ✅ Sudah diperbaiki dan dimodernisasi

**Fitur:**
- Design modern dengan gradient background
- Animasi smooth dengan flutter_animate
- Form validation (email & password)
- Loading indicator saat proses login
- Error handling dengan pesan yang jelas
- Link ke Forgot Password
- Link ke Register
- Responsive untuk berbagai ukuran layar mobile

**API Integration:**
- Endpoint: `POST /api/login`
- Input: email, password
- Output: user data + auth token

---

### 2. **Register Screen** (lib/screens/auth/register_screen.dart)
**Status:** ✅ Sudah diperbaiki dan dimodernisasi  

**Fitur:**
- Design modern dengan gradient background yang sama dengan login
- Icon person_add dengan gradient circle
- Animasi smooth untuk semua elemen
- Form lengkap:
  - Name (required, min 2 karakter)
  - Email (required, format email valid)
  - Phone (optional, format nomor telepon)
  - Institution (optional)
  - Password (required, min 6 karakter)
  - Confirm Password (required, harus match)
- Back button dengan animasi
- Loading indicator saat proses registrasi
- Error handling
- Link kembali ke login

**API Integration:**
- Endpoint: `POST /api/register`
- Input: name, email, phone, institution, password, password_confirmation
- Output: user data + auth token

---

### 3. **Forgot Password Screen** (lib/screens/auth/forgot_password_screen.dart)
**Status:** ✅ Sudah diperbaiki dan dimodernisasi

**Fitur:**
- Design modern dengan gradient background
- Icon lock_reset dengan gradient circle dan shadow
- Animasi smooth
- Two-stage UI:
  1. **Input Email Stage:**
     - Email field dengan validation
     - Send button dengan loading
  2. **Success Stage:**
     - Success message dengan green badge
     - Button kembali ke login
- Back button dengan animasi
- Error handling dengan pesan yang jelas
- Form validation (format email)

**API Integration:**
- Endpoint: `POST /api/forgot-password`
- Input: email
- Output: status message

---

## 🎨 DESIGN SYSTEM

### Color Palette (AppTheme)
```dart
primaryColor: Color(0xFF6366F1)      // Indigo
secondaryColor: Color(0xFFA855F7)    // Purple
accentColor: Color(0xFFF59E0B)       // Amber
successColor: Color(0xFF10B981)      // Green
errorColor: Color(0xFFEF4444)        // Red
warningColor: Color(0xFFF59E0B)      // Orange
```

### Typography
- **Font:** Google Fonts - Inter
- **Heading:** Bold, 24-28px
- **Body:** Regular, 14-16px
- **Button:** Semi-bold, 16px

### Components
1. **Gradient Background** - Soft gradient untuk semua halaman auth
2. **Animated Icons** - Icon dalam circle dengan gradient dan shadow
3. **Text Fields** - Rounded border (12px), icon prefix, clean design
4. **Buttons** - Full width, rounded (12px), dengan loading indicator
5. **Error Messages** - Red badge dengan icon dan border
6. **Success Messages** - Green badge dengan icon dan border

---

## 🔄 NAVIGATION FLOW

```
┌─────────────────┐
│  Splash Screen  │
└────────┬────────┘
         │
    ┌────▼────┐
    │AuthWrapper│ (Cek authentication)
    └────┬─────┘
         │
    ┌────▼─────────────┐
    │ Sudah Login?     │
    └──┬───────────┬───┘
  Yes  │           │  No
   ┌───▼──┐    ┌──▼──────┐
   │ Home │    │  Login  │
   └──────┘    └────┬────┘
                    │
         ┌──────────┼──────────┐
         │          │          │
    ┌────▼──┐  ┌───▼───────┐ ┌▼─────────┐
    │Register│  │Forgot Pass│ │  Home    │
    └────┬───┘  └─────┬─────┘ │ (setelah │
         │            │        │  login)  │
         └────────────┴────────►          │
                                └──────────┘
```

---

## 📋 CHECKLIST HALAMAN

### Auth Pages
- [x] Login Screen - Modern, Animated, Responsive
- [x] Register Screen - Modern, Animated, Responsive
- [x] Forgot Password Screen - Modern, Animated, Responsive
- [ ] OTP Verification Screen (jika perlu)
- [ ] Reset Password Screen (jika perlu)

### Main Pages
- [x] Home Screen - Modern, Animated
- [ ] Event List Screen
- [ ] Event Detail Screen
- [ ] Profile Screen
- [ ] Edit Profile Screen
- [ ] My Events Screen
- [ ] Certificates Screen
- [ ] Attendance Screen
- [ ] Notifications Screen

---

## 🔧 CARA NAVIGASI ANTAR HALAMAN

### Dari Login ke Register
```dart
Navigator.push(
  context,
  MaterialPageRoute(builder: (context) => const RegisterScreen()),
);
```

### Dari Login ke Forgot Password
```dart
Navigator.push(
  context,
  MaterialPageRoute(builder: (context) => const ForgotPasswordScreen()),
);
```

### Dari Register/Forgot Password ke Login
```dart
Navigator.pop(context); // Kembali ke halaman sebelumnya
```

### Setelah Login Berhasil
```dart
// Automatic navigation by AuthWrapper
// User akan diarahkan ke MainScreen/HomeScreen
```

---

## 📱 RESPONSIVE DESIGN

Semua halaman sudah responsive untuk:
- ✅ Small phones (< 360px width)
- ✅ Normal phones (360px - 414px)
- ✅ Large phones (> 414px)
- ✅ Tablets (portrait & landscape)

**Teknik yang digunakan:**
- SafeArea untuk menghindari notch
- SingleChildScrollView untuk konten panjang
- Flexible/Expanded untuk layout dinamis
- MediaQuery untuk ukuran spesifik (jika perlu)

---

## 🎯 FORM VALIDATION

### Login Screen
- Email: Required, format email valid
- Password: Required

### Register Screen
- Name: Required, min 2 karakter
- Email: Required, format email valid, unique
- Phone: Optional, format nomor telepon
- Institution: Optional
- Password: Required, min 6 karakter
- Confirm Password: Required, harus match dengan password

### Forgot Password Screen
- Email: Required, format email valid

---

## 🚀 ANIMASI

Menggunakan **flutter_animate** package:

### Jenis Animasi:
1. **Fade In** - Muncul dengan opacity
2. **Slide X** - Geser horizontal
3. **Slide Y** - Geser vertikal
4. **Scale** - Zoom in/out
5. **Combined** - Kombinasi beberapa animasi

### Durasi:
- Fast: 300ms (back button, icons)
- Normal: 500-600ms (cards, forms)
- Slow: 800ms+ (large elements)

### Curves:
- easeOut - Default smooth
- easeOutBack - Bouncy effect
- elasticOut - Spring effect

---

## 💡 TIPS DEVELOPMENT

### 1. Hot Reload vs Hot Restart
- **Hot Reload (r):** Untuk perubahan UI kecil
- **Hot Restart (R):** Untuk perubahan logic/state
- **Full Restart:** Untuk perubahan API endpoint

### 2. Testing Halaman
```bash
# Run di emulator
flutter run --hot

# Run di device fisik
flutter run --hot --release
```

### 3. Debug Layout Issues
```dart
// Tambahkan border untuk debug
Container(
  decoration: BoxDecoration(
    border: Border.all(color: Colors.red),
  ),
  child: YourWidget(),
)
```

---

## ✅ KESIMPULAN

**Halaman Auth Mobile yang sudah lengkap:**
1. ✅ Login Screen - Modern, responsive, terintegrasi dengan API
2. ✅ Register Screen - Modern, responsive, form lengkap
3. ✅ Forgot Password Screen - Modern, responsive, two-stage UI

**Semua halaman:**
- Menggunakan design system yang konsisten
- Terintegrasi dengan backend Laravel API
- Memiliki error handling yang baik
- Responsive untuk berbagai ukuran layar
- Animasi smooth dan modern

**Siap untuk production! 🚀**

