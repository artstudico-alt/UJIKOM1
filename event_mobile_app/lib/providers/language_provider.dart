import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LanguageProvider extends ChangeNotifier {
  static const String _languageKey = 'language_code';
  
  Locale _locale = const Locale('id', 'ID');
  
  Locale get locale => _locale;
  
  bool get isIndonesian => _locale.languageCode == 'id';
  bool get isEnglish => _locale.languageCode == 'en';

  LanguageProvider() {
    _loadLanguage();
  }

  Future<void> _loadLanguage() async {
    final prefs = await SharedPreferences.getInstance();
    final languageCode = prefs.getString(_languageKey) ?? 'id';
    _locale = Locale(languageCode);
    notifyListeners();
  }

  Future<void> setLocale(Locale locale) async {
    _locale = locale;
    notifyListeners();
    
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_languageKey, locale.languageCode);
  }

  Future<void> toggleLanguage() async {
    if (_locale.languageCode == 'id') {
      await setLocale(const Locale('en', 'US'));
    } else {
      await setLocale(const Locale('id', 'ID'));
    }
  }
}
