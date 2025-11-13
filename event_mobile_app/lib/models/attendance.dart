import 'event.dart';
import 'user.dart';

class Attendance {
  final int id;
  final int eventId;
  final int userId;
  final DateTime checkInTime;
  final DateTime? checkOutTime;
  final String status;
  final String? qrCode;
  final String? notes;
  final Event? event;
  final User? user;

  Attendance({
    required this.id,
    required this.eventId,
    required this.userId,
    required this.checkInTime,
    this.checkOutTime,
    required this.status,
    this.qrCode,
    this.notes,
    this.event,
    this.user,
  });

  factory Attendance.fromJson(Map<String, dynamic> json) {
    return Attendance(
      id: json['id'],
      eventId: json['event_id'],
      userId: json['user_id'],
      checkInTime: DateTime.parse(json['check_in_time']),
      checkOutTime: json['check_out_time'] != null
          ? DateTime.parse(json['check_out_time'])
          : null,
      status: json['status'],
      qrCode: json['qr_code'],
      notes: json['notes'],
      event: json['event'] != null ? Event.fromJson(json['event']) : null,
      user: json['user'] != null ? User.fromJson(json['user']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'event_id': eventId,
      'user_id': userId,
      'check_in_time': checkInTime.toIso8601String(),
      'check_out_time': checkOutTime?.toIso8601String(),
      'status': status,
      'qr_code': qrCode,
      'notes': notes,
      'event': event?.toJson(),
      'user': user?.toJson(),
    };
  }

  bool get isPresent => status == 'present';
  bool get isAbsent => status == 'absent';
  bool get isLate => status == 'late';
  bool get isCheckedOut => checkOutTime != null;

  String get statusText {
    switch (status) {
      case 'present':
        return 'Hadir';
      case 'absent':
        return 'Tidak Hadir';
      case 'late':
        return 'Terlambat';
      default:
        return 'Tidak Diketahui';
    }
  }

  String get duration {
    final checkout = checkOutTime;
    if (checkout != null) {
      final difference = checkout.difference(checkInTime);
      final hours = difference.inHours;
      final minutes = difference.inMinutes % 60;

      if (hours > 0) {
        return '${hours}h ${minutes}m';
      } else {
        return '${minutes}m';
      }
    }
    return 'Masih berlangsung';
  }
}
