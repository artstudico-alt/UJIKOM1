import '../models/attendance.dart';
import 'api_service.dart';

class AttendanceService {
  static Future<bool> checkIn(int eventId, {String? qrCode}) async {
    try {
      final response = await ApiService.checkIn(eventId, qrCode: qrCode);
      return response['success'] == true;
    } catch (e) {
      print('Check in error: $e');
      return false;
    }
  }

  static Future<bool> checkOut(int eventId) async {
    try {
      final response = await ApiService.checkOut(eventId);
      return response['success'] == true;
    } catch (e) {
      print('Check out error: $e');
      return false;
    }
  }

  static Future<List<Attendance>> getUserAttendance() async {
    try {
      final response = await ApiService.getUserAttendance();
      
      if (response['success'] == true) {
        final List<dynamic> attendanceData = response['data'];
        return attendanceData.map((json) => Attendance.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      print('Get user attendance error: $e');
      return [];
    }
  }

  static List<Attendance> filterAttendanceByStatus(List<Attendance> attendance, String status) {
    switch (status) {
      case 'present':
        return attendance.where((att) => att.isPresent).toList();
      case 'absent':
        return attendance.where((att) => att.isAbsent).toList();
      case 'late':
        return attendance.where((att) => att.isLate).toList();
      default:
        return attendance;
    }
  }

  static List<Attendance> sortAttendanceByDate(List<Attendance> attendance, {bool ascending = true}) {
    attendance.sort((a, b) {
      if (ascending) {
        return a.checkInTime.compareTo(b.checkInTime);
      } else {
        return b.checkInTime.compareTo(a.checkInTime);
      }
    });
    return attendance;
  }

  static Map<String, int> getAttendanceStats(List<Attendance> attendance) {
    int present = 0;
    int absent = 0;
    int late = 0;
    
    for (var att in attendance) {
      if (att.isPresent) present++;
      if (att.isAbsent) absent++;
      if (att.isLate) late++;
    }
    
    return {
      'present': present,
      'absent': absent,
      'late': late,
      'total': attendance.length,
    };
  }
}
