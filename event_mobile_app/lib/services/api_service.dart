import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:io';

class ApiService {
  // IMPORTANT: Use 10.0.2.2 for Android emulator to access host machine's localhost
  // 10.0.2.2 is a special alias to your host loopback interface (127.0.0.1)
  static const String baseUrl = 'http://10.0.2.2:8000/api';
  static const String frontendUrl = 'http://10.0.2.2:3000';

  // Alternative URLs for testing
  static const String baseUrlLocalhost = 'http://localhost:8000/api';
  static const String baseUrlIP = 'http://172.16.2.54:8000/api'; // Your WiFi IP

  // HTTP Client with timeout configuration
  static final http.Client _client = http.Client();

  // Timeout duration (30 seconds)
  static const Duration _timeout = Duration(seconds: 30);

  static Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');

    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  static Future<Map<String, dynamic>> _handleResponse(
    http.Response response,
  ) async {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return json.decode(response.body);
    } else {
      final errorBody = json.decode(response.body);
      throw Exception(errorBody['message'] ?? 'Terjadi kesalahan');
    }
  }

  // Helper method for HTTP requests with timeout and error handling
  static Future<http.Response> _makeRequest(
    Future<http.Response> Function() request,
  ) async {
    try {
      return await request().timeout(_timeout);
    } on SocketException {
      throw Exception(
        'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
      );
    } on HttpException {
      throw Exception('Terjadi kesalahan HTTP. Silakan coba lagi.');
    } on FormatException {
      throw Exception('Format data tidak valid.');
    } catch (e) {
      if (e.toString().contains('TimeoutException')) {
        throw Exception(
          'Request timeout. Server tidak merespons dalam waktu yang ditentukan.',
        );
      }
      throw Exception('Terjadi kesalahan: ${e.toString()}');
    }
  }

  // Authentication endpoints
  static Future<Map<String, dynamic>> login(
    String email,
    String password,
  ) async {
    final headers = await _getHeaders();
    final response = await _makeRequest(
      () => _client.post(
        Uri.parse('$baseUrl/login'),
        headers: headers,
        body: json.encode({'email': email, 'password': password}),
      ),
    );
    return _handleResponse(response);
  }

  static Future<Map<String, dynamic>> register(
    Map<String, dynamic> userData,
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/register'),
      headers: await _getHeaders(),
      body: json.encode(userData),
    );
    return _handleResponse(response);
  }

  static Future<Map<String, dynamic>> forgotPassword(String email) async {
    final headers = await _getHeaders();
    final response = await _makeRequest(
      () => _client.post(
        Uri.parse('$baseUrl/forgot-password'),
        headers: headers,
        body: json.encode({'email': email}),
      ),
    );
    return _handleResponse(response);
  }

  static Future<Map<String, dynamic>> logout() async {
    final response = await http.post(
      Uri.parse('$baseUrl/logout'),
      headers: await _getHeaders(),
    );
    return _handleResponse(response);
  }

  // User endpoints
  static Future<Map<String, dynamic>> getUserProfile() async {
    final response = await http.get(
      Uri.parse('$baseUrl/user/profile'),
      headers: await _getHeaders(),
    );
    return _handleResponse(response);
  }

  static Future<Map<String, dynamic>> updateUserProfile(
    Map<String, dynamic> userData,
  ) async {
    final response = await http.put(
      Uri.parse('$baseUrl/user/profile'),
      headers: await _getHeaders(),
      body: json.encode(userData),
    );
    return _handleResponse(response);
  }

  // Events endpoints
  static Future<Map<String, dynamic>> getEvents({
    String? search,
    String? status,
    int page = 1,
    int limit = 10,
  }) async {
    final queryParams = <String, String>{
      'page': page.toString(),
      'limit': limit.toString(),
    };

    if (search != null && search.isNotEmpty) {
      queryParams['search'] = search;
    }

    if (status != null && status.isNotEmpty) {
      queryParams['status'] = status;
    }

    final uri = Uri.parse(
      '$baseUrl/events',
    ).replace(queryParameters: queryParams);
    final headers = await _getHeaders();
    final response = await _makeRequest(
      () => _client.get(uri, headers: headers),
    );
    return _handleResponse(response);
  }

  static Future<Map<String, dynamic>> getEvent(int eventId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/events/$eventId'),
      headers: await _getHeaders(),
    );
    return _handleResponse(response);
  }

  // Event Registration endpoints
  static Future<Map<String, dynamic>> registerForEvent(
    int eventId, {
    String? notes,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/events/$eventId/register'),
      headers: await _getHeaders(),
      body: json.encode({'notes': notes}),
    );
    return _handleResponse(response);
  }

  static Future<Map<String, dynamic>> getUserRegistrations() async {
    final response = await http.get(
      Uri.parse('$baseUrl/user/registrations'),
      headers: await _getHeaders(),
    );
    return _handleResponse(response);
  }

  static Future<Map<String, dynamic>> cancelRegistration(
    int registrationId,
  ) async {
    final response = await http.delete(
      Uri.parse('$baseUrl/registrations/$registrationId'),
      headers: await _getHeaders(),
    );
    return _handleResponse(response);
  }

  // Attendance endpoints
  static Future<Map<String, dynamic>> checkIn(
    int eventId, {
    String? qrCode,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/events/$eventId/check-in'),
      headers: await _getHeaders(),
      body: json.encode({'qr_code': qrCode}),
    );
    return _handleResponse(response);
  }

  static Future<Map<String, dynamic>> checkOut(int eventId) async {
    final response = await http.post(
      Uri.parse('$baseUrl/events/$eventId/check-out'),
      headers: await _getHeaders(),
    );
    return _handleResponse(response);
  }

  static Future<Map<String, dynamic>> getUserAttendance() async {
    final response = await http.get(
      Uri.parse('$baseUrl/user/attendance'),
      headers: await _getHeaders(),
    );
    return _handleResponse(response);
  }

  // Certificate endpoints
  static Future<Map<String, dynamic>> getUserCertificates() async {
    final response = await http.get(
      Uri.parse('$baseUrl/user/certificates'),
      headers: await _getHeaders(),
    );
    return _handleResponse(response);
  }

  static Future<Map<String, dynamic>> downloadCertificate(
    int certificateId,
  ) async {
    final response = await http.get(
      Uri.parse('$baseUrl/certificates/$certificateId/download'),
      headers: await _getHeaders(),
    );
    return _handleResponse(response);
  }

  // Notification endpoints
  static Future<Map<String, dynamic>> getNotifications() async {
    final response = await http.get(
      Uri.parse('$baseUrl/user/notifications'),
      headers: await _getHeaders(),
    );
    return _handleResponse(response);
  }

  static Future<Map<String, dynamic>> markNotificationAsRead(
    int notificationId,
  ) async {
    final response = await http.put(
      Uri.parse('$baseUrl/notifications/$notificationId/read'),
      headers: await _getHeaders(),
    );
    return _handleResponse(response);
  }

  static Future<Map<String, dynamic>> markAllNotificationsAsRead() async {
    final response = await http.put(
      Uri.parse('$baseUrl/notifications/read-all'),
      headers: await _getHeaders(),
    );
    return _handleResponse(response);
  }
}
