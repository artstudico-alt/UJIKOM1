import 'package:flutter/material.dart';
import '../models/user.dart';
import '../services/auth_service.dart';

class AuthProvider extends ChangeNotifier {
  User? _user;
  bool _isLoading = false;
  String? _errorMessage;

  User? get user => _user;
  bool get isLoggedIn => _user != null;
  bool get isAuthenticated => _user != null;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  AuthProvider() {
    _loadUser();
  }

  void _loadUser() {
    _user = AuthService.currentUser;
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _setLoading(true);
    _clearError();

    try {
      final success = await AuthService.login(email, password);
      if (success) {
        _user = AuthService.currentUser;
        notifyListeners();
        return true;
      } else {
        _setError('Email atau password salah');
        return false;
      }
    } catch (e) {
      _setError('Terjadi kesalahan saat login');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> register(Map<String, dynamic> userData) async {
    _setLoading(true);
    _clearError();

    try {
      final success = await AuthService.register(userData);
      if (success) {
        _user = AuthService.currentUser;
        notifyListeners();
        return true;
      } else {
        _setError('Gagal membuat akun');
        return false;
      }
    } catch (e) {
      _setError('Terjadi kesalahan saat registrasi');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> forgotPassword(String email) async {
    _setLoading(true);
    _clearError();

    try {
      final success = await AuthService.forgotPassword(email);
      if (success) {
        return true;
      } else {
        _setError('Email tidak ditemukan');
        return false;
      }
    } catch (e) {
      _setError(e.toString().replaceFirst('Exception: ', ''));
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> logout() async {
    _setLoading(true);
    _clearError();

    try {
      final success = await AuthService.logout();
      if (success) {
        _user = null;
        notifyListeners();
        return true;
      } else {
        _setError('Gagal logout');
        return false;
      }
    } catch (e) {
      _setError('Terjadi kesalahan saat logout');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> updateProfile(Map<String, dynamic> userData) async {
    _setLoading(true);
    _clearError();

    try {
      final success = await AuthService.updateUserProfile(userData);
      if (success) {
        _user = AuthService.currentUser;
        notifyListeners();
        return true;
      } else {
        _setError('Gagal mengupdate profil');
        return false;
      }
    } catch (e) {
      _setError('Terjadi kesalahan saat mengupdate profil');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> refreshProfile() async {
    try {
      final success = await AuthService.refreshUserProfile();
      if (success) {
        _user = AuthService.currentUser;
        notifyListeners();
      }
    } catch (e) {
      print('Refresh profile error: $e');
    }
  }

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String error) {
    _errorMessage = error;
    notifyListeners();
  }

  void _clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  void clearError() {
    _clearError();
  }
}
