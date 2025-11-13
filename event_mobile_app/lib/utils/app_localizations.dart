import 'package:flutter/material.dart';

class AppLocalizations {
  final Locale locale;

  AppLocalizations(this.locale);

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate = _AppLocalizationsDelegate();

  static const List<Locale> supportedLocales = [
    Locale('id', 'ID'),
    Locale('en', 'US'),
  ];

  // Common
  String get appName => _localizedValues[locale.languageCode]!['appName']!;
  String get loading => _localizedValues[locale.languageCode]!['loading']!;
  String get error => _localizedValues[locale.languageCode]!['error']!;
  String get success => _localizedValues[locale.languageCode]!['success']!;
  String get cancel => _localizedValues[locale.languageCode]!['cancel']!;
  String get save => _localizedValues[locale.languageCode]!['save']!;
  String get delete => _localizedValues[locale.languageCode]!['delete']!;
  String get edit => _localizedValues[locale.languageCode]!['edit']!;
  String get search => _localizedValues[locale.languageCode]!['search']!;
  String get filter => _localizedValues[locale.languageCode]!['filter']!;
  String get sort => _localizedValues[locale.languageCode]!['sort']!;
  String get refresh => _localizedValues[locale.languageCode]!['refresh']!;
  String get retry => _localizedValues[locale.languageCode]!['retry']!;
  String get back => _localizedValues[locale.languageCode]!['back']!;
  String get next => _localizedValues[locale.languageCode]!['next']!;
  String get previous => _localizedValues[locale.languageCode]!['previous']!;
  String get close => _localizedValues[locale.languageCode]!['close']!;
  String get done => _localizedValues[locale.languageCode]!['done']!;
  String get yes => _localizedValues[locale.languageCode]!['yes']!;
  String get no => _localizedValues[locale.languageCode]!['no']!;
  String get ok => _localizedValues[locale.languageCode]!['ok']!;

  // Authentication
  String get login => _localizedValues[locale.languageCode]!['login']!;
  String get register => _localizedValues[locale.languageCode]!['register']!;
  String get logout => _localizedValues[locale.languageCode]!['logout']!;
  String get email => _localizedValues[locale.languageCode]!['email']!;
  String get password => _localizedValues[locale.languageCode]!['password']!;
  String get confirmPassword => _localizedValues[locale.languageCode]!['confirmPassword']!;
  String get forgotPassword => _localizedValues[locale.languageCode]!['forgotPassword']!;
  String get name => _localizedValues[locale.languageCode]!['name']!;
  String get phone => _localizedValues[locale.languageCode]!['phone']!;
  String get institution => _localizedValues[locale.languageCode]!['institution']!;

  // Navigation
  String get home => _localizedValues[locale.languageCode]!['home']!;
  String get events => _localizedValues[locale.languageCode]!['events']!;
  String get certificates => _localizedValues[locale.languageCode]!['certificates']!;
  String get attendance => _localizedValues[locale.languageCode]!['attendance']!;
  String get profile => _localizedValues[locale.languageCode]!['profile']!;
  String get notifications => _localizedValues[locale.languageCode]!['notifications']!;

  // Events
  String get eventDetails => _localizedValues[locale.languageCode]!['eventDetails']!;
  String get registerForEvent => _localizedValues[locale.languageCode]!['registerForEvent']!;
  String get eventRegistration => _localizedValues[locale.languageCode]!['eventRegistration']!;
  String get myEvents => _localizedValues[locale.languageCode]!['myEvents']!;
  String get upcomingEvents => _localizedValues[locale.languageCode]!['upcomingEvents']!;
  String get ongoingEvents => _localizedValues[locale.languageCode]!['ongoingEvents']!;
  String get completedEvents => _localizedValues[locale.languageCode]!['completedEvents']!;

  // Attendance
  String get checkIn => _localizedValues[locale.languageCode]!['checkIn']!;
  String get checkOut => _localizedValues[locale.languageCode]!['checkOut']!;
  String get scanQRCode => _localizedValues[locale.languageCode]!['scanQRCode']!;
  String get attendanceHistory => _localizedValues[locale.languageCode]!['attendanceHistory']!;

  // Certificates
  String get myCertificates => _localizedValues[locale.languageCode]!['myCertificates']!;
  String get downloadCertificate => _localizedValues[locale.languageCode]!['downloadCertificate']!;
  String get verifyCertificate => _localizedValues[locale.languageCode]!['verifyCertificate']!;

  // Profile
  String get editProfile => _localizedValues[locale.languageCode]!['editProfile']!;
  String get settings => _localizedValues[locale.languageCode]!['settings']!;
  String get theme => _localizedValues[locale.languageCode]!['theme']!;
  String get language => _localizedValues[locale.languageCode]!['language']!;
  String get about => _localizedValues[locale.languageCode]!['about']!;

  static final Map<String, Map<String, String>> _localizedValues = {
    'id': {
      'appName': 'EventHub Mobile',
      'loading': 'Memuat...',
      'error': 'Terjadi Kesalahan',
      'success': 'Berhasil',
      'cancel': 'Batal',
      'save': 'Simpan',
      'delete': 'Hapus',
      'edit': 'Edit',
      'search': 'Cari',
      'filter': 'Filter',
      'sort': 'Urutkan',
      'refresh': 'Refresh',
      'retry': 'Coba Lagi',
      'back': 'Kembali',
      'next': 'Selanjutnya',
      'previous': 'Sebelumnya',
      'close': 'Tutup',
      'done': 'Selesai',
      'yes': 'Ya',
      'no': 'Tidak',
      'ok': 'OK',
      'login': 'Masuk',
      'register': 'Daftar',
      'logout': 'Keluar',
      'email': 'Email',
      'password': 'Kata Sandi',
      'confirmPassword': 'Konfirmasi Kata Sandi',
      'forgotPassword': 'Lupa Kata Sandi',
      'name': 'Nama',
      'phone': 'Telepon',
      'institution': 'Institusi',
      'home': 'Beranda',
      'events': 'Event',
      'certificates': 'Sertifikat',
      'attendance': 'Kehadiran',
      'profile': 'Profil',
      'notifications': 'Notifikasi',
      'eventDetails': 'Detail Event',
      'registerForEvent': 'Daftar Event',
      'eventRegistration': 'Pendaftaran Event',
      'myEvents': 'Event Saya',
      'upcomingEvents': 'Event Mendatang',
      'ongoingEvents': 'Event Berlangsung',
      'completedEvents': 'Event Selesai',
      'checkIn': 'Check In',
      'checkOut': 'Check Out',
      'scanQRCode': 'Scan QR Code',
      'attendanceHistory': 'Riwayat Kehadiran',
      'myCertificates': 'Sertifikat Saya',
      'downloadCertificate': 'Download Sertifikat',
      'verifyCertificate': 'Verifikasi Sertifikat',
      'editProfile': 'Edit Profil',
      'settings': 'Pengaturan',
      'theme': 'Tema',
      'language': 'Bahasa',
      'about': 'Tentang',
    },
    'en': {
      'appName': 'EventHub Mobile',
      'loading': 'Loading...',
      'error': 'Error',
      'success': 'Success',
      'cancel': 'Cancel',
      'save': 'Save',
      'delete': 'Delete',
      'edit': 'Edit',
      'search': 'Search',
      'filter': 'Filter',
      'sort': 'Sort',
      'refresh': 'Refresh',
      'retry': 'Retry',
      'back': 'Back',
      'next': 'Next',
      'previous': 'Previous',
      'close': 'Close',
      'done': 'Done',
      'yes': 'Yes',
      'no': 'No',
      'ok': 'OK',
      'login': 'Login',
      'register': 'Register',
      'logout': 'Logout',
      'email': 'Email',
      'password': 'Password',
      'confirmPassword': 'Confirm Password',
      'forgotPassword': 'Forgot Password',
      'name': 'Name',
      'phone': 'Phone',
      'institution': 'Institution',
      'home': 'Home',
      'events': 'Events',
      'certificates': 'Certificates',
      'attendance': 'Attendance',
      'profile': 'Profile',
      'notifications': 'Notifications',
      'eventDetails': 'Event Details',
      'registerForEvent': 'Register for Event',
      'eventRegistration': 'Event Registration',
      'myEvents': 'My Events',
      'upcomingEvents': 'Upcoming Events',
      'ongoingEvents': 'Ongoing Events',
      'completedEvents': 'Completed Events',
      'checkIn': 'Check In',
      'checkOut': 'Check Out',
      'scanQRCode': 'Scan QR Code',
      'attendanceHistory': 'Attendance History',
      'myCertificates': 'My Certificates',
      'downloadCertificate': 'Download Certificate',
      'verifyCertificate': 'Verify Certificate',
      'editProfile': 'Edit Profile',
      'settings': 'Settings',
      'theme': 'Theme',
      'language': 'Language',
      'about': 'About',
    },
  };
}

class _AppLocalizationsDelegate extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) {
    return ['id', 'en'].contains(locale.languageCode);
  }

  @override
  Future<AppLocalizations> load(Locale locale) async {
    return AppLocalizations(locale);
  }

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}
