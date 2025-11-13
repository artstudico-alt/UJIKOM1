class AppNotification {
  final int id;
  final String title;
  final String message;
  final String type;
  final String? data;
  final bool isRead;
  final DateTime createdAt;
  final DateTime? readAt;

  AppNotification({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    this.data,
    required this.isRead,
    required this.createdAt,
    this.readAt,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['id'],
      title: json['title'],
      message: json['message'],
      type: json['type'],
      data: json['data'],
      isRead: json['is_read'] ?? false,
      createdAt: DateTime.parse(json['created_at']),
      readAt: json['read_at'] != null 
          ? DateTime.parse(json['read_at']) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'message': message,
      'type': type,
      'data': data,
      'is_read': isRead,
      'created_at': createdAt.toIso8601String(),
      'read_at': readAt?.toIso8601String(),
    };
  }

  String get typeText {
    switch (type) {
      case 'registration_approved':
        return 'Pendaftaran Disetujui';
      case 'registration_rejected':
        return 'Pendaftaran Ditolak';
      case 'event_reminder':
        return 'Pengingat Event';
      case 'certificate_ready':
        return 'Sertifikat Tersedia';
      case 'attendance_reminder':
        return 'Pengingat Kehadiran';
      case 'event_cancelled':
        return 'Event Dibatalkan';
      case 'event_updated':
        return 'Event Diperbarui';
      default:
        return 'Notifikasi';
    }
  }

  String get formattedDate {
    final now = DateTime.now();
    final difference = now.difference(createdAt);
    
    if (difference.inDays > 0) {
      return '${difference.inDays} hari yang lalu';
    } else if (difference.inHours > 0) {
      return '${difference.inHours} jam yang lalu';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes} menit yang lalu';
    } else {
      return 'Baru saja';
    }
  }
}
