import 'event.dart';
import 'user.dart';

class EventRegistration {
  final int id;
  final int eventId;
  final int userId;
  final String status;
  final String? notes;
  final DateTime registeredAt;
  final DateTime? approvedAt;
  final DateTime? rejectedAt;
  final String? rejectionReason;
  final Event? event;
  final User? user;

  EventRegistration({
    required this.id,
    required this.eventId,
    required this.userId,
    required this.status,
    this.notes,
    required this.registeredAt,
    this.approvedAt,
    this.rejectedAt,
    this.rejectionReason,
    this.event,
    this.user,
  });

  factory EventRegistration.fromJson(Map<String, dynamic> json) {
    return EventRegistration(
      id: json['id'],
      eventId: json['event_id'],
      userId: json['user_id'],
      status: json['status'],
      notes: json['notes'],
      registeredAt: DateTime.parse(json['registered_at']),
      approvedAt: json['approved_at'] != null 
          ? DateTime.parse(json['approved_at']) 
          : null,
      rejectedAt: json['rejected_at'] != null 
          ? DateTime.parse(json['rejected_at']) 
          : null,
      rejectionReason: json['rejection_reason'],
      event: json['event'] != null 
          ? Event.fromJson(json['event']) 
          : null,
      user: json['user'] != null 
          ? User.fromJson(json['user']) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'event_id': eventId,
      'user_id': userId,
      'status': status,
      'notes': notes,
      'registered_at': registeredAt.toIso8601String(),
      'approved_at': approvedAt?.toIso8601String(),
      'rejected_at': rejectedAt?.toIso8601String(),
      'rejection_reason': rejectionReason,
      'event': event?.toJson(),
      'user': user?.toJson(),
    };
  }

  bool get isPending => status == 'pending';
  bool get isApproved => status == 'approved';
  bool get isRejected => status == 'rejected';
  bool get isCancelled => status == 'cancelled';

  String get statusText {
    switch (status) {
      case 'pending':
        return 'Menunggu Persetujuan';
      case 'approved':
        return 'Disetujui';
      case 'rejected':
        return 'Ditolak';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return 'Tidak Diketahui';
    }
  }
}
