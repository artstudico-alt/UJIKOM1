import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import '../models/user.dart';
import 'api_service.dart';

class AuthService {
  static User? _currentUser;
  static String? _authToken;

  static User? get currentUser => _currentUser;
  static String? get authToken => _authToken;
  static bool get isLoggedIn => _authToken != null && _currentUser != null;

  static Future<bool> login(String email, String password) async {
    try {
      final response = await ApiService.login(email, password);

      if (response['status'] == 'success') {
        final token = response['data']['token'];
        final userData = response['data']['user'];

        // Save token and user data
        await _saveAuthData(token, userData);

        // Set current user
        _authToken = token;
        _currentUser = User.fromJson(userData);

        return true;
      }
      return false;
    } catch (e) {
      print('Login error: $e');
      return false;
    }
  }

  static Future<bool> register(Map<String, dynamic> userData) async {
    try {
      final response = await ApiService.register(userData);

      if (response['success'] == true) {
        final token = response['data']['token'];
        final user = response['data']['user'];

        // Save token and user data
        await _saveAuthData(token, user);

        // Set current user
        _authToken = token;
        _currentUser = User.fromJson(user);

        return true;
      }
      return false;
    } catch (e) {
      print('Register error: $e');
      return false;
    }
  }

  static Future<bool> forgotPassword(String email) async {
    try {
      final response = await ApiService.forgotPassword(email);
      return response['status'] == 'success';
    } catch (e) {
      print('Forgot password error: $e');
      // Re-throw the exception with the specific error message
      throw Exception(e.toString());
    }
  }

  static Future<bool> logout() async {
    try {
      if (_authToken != null) {
        await ApiService.logout();
      }

      // Clear local data
      await _clearAuthData();

      // Clear current user
      _authToken = null;
      _currentUser = null;

      return true;
    } catch (e) {
      print('Logout error: $e');
      return false;
    }
  }

  static Future<bool> loadAuthData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('auth_token');
      final userJson = prefs.getString('user_data');

      if (token != null && userJson != null) {
        // Check if token is expired
        if (JwtDecoder.isExpired(token)) {
          await _clearAuthData();
          return false;
        }

        _authToken = token;
        _currentUser = User.fromJson(json.decode(userJson));
        return true;
      }
      return false;
    } catch (e) {
      print('Load auth data error: $e');
      return false;
    }
  }

  static Future<bool> updateUserProfile(Map<String, dynamic> userData) async {
    try {
      final response = await ApiService.updateUserProfile(userData);

      if (response['success'] == true) {
        final updatedUser = User.fromJson(response['data']);

        // Update current user
        _currentUser = updatedUser;

        // Save updated user data
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user_data', json.encode(updatedUser.toJson()));

        return true;
      }
      return false;
    } catch (e) {
      print('Update profile error: $e');
      return false;
    }
  }

  static Future<bool> refreshUserProfile() async {
    try {
      final response = await ApiService.getUserProfile();

      if (response['success'] == true) {
        final user = User.fromJson(response['data']);

        // Update current user
        _currentUser = user;

        // Save updated user data
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user_data', json.encode(user.toJson()));

        return true;
      }
      return false;
    } catch (e) {
      print('Refresh profile error: $e');
      return false;
    }
  }

  static Future<void> _saveAuthData(
    String token,
    Map<String, dynamic> userData,
  ) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
    await prefs.setString('user_data', json.encode(userData));
  }

  static Future<void> _clearAuthData() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('user_data');
  }
}
