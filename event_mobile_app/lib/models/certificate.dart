import 'event.dart';
import 'user.dart';

class Certificate {
  final int id;
  final int eventId;
  final int userId;
  final String title;
  final String? description;
  final String? certificateNumber;
  final String? filePath;
  final String? downloadUrl;
  final DateTime issuedAt;
  final DateTime? expiresAt;
  final String status;
  final Event? event;
  final User? user;

  Certificate({
    required this.id,
    required this.eventId,
    required this.userId,
    required this.title,
    this.description,
    this.certificateNumber,
    this.filePath,
    this.downloadUrl,
    required this.issuedAt,
    this.expiresAt,
    required this.status,
    this.event,
    this.user,
  });

  factory Certificate.fromJson(Map<String, dynamic> json) {
    return Certificate(
      id: json['id'],
      eventId: json['event_id'],
      userId: json['user_id'],
      title: json['title'],
      description: json['description'],
      certificateNumber: json['certificate_number'],
      filePath: json['file_path'],
      downloadUrl: json['download_url'],
      issuedAt: DateTime.parse(json['issued_at']),
      expiresAt: json['expires_at'] != null
          ? DateTime.parse(json['expires_at'])
          : null,
      status: json['status'],
      event: json['event'] != null ? Event.fromJson(json['event']) : null,
      user: json['user'] != null ? User.fromJson(json['user']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'event_id': eventId,
      'user_id': userId,
      'title': title,
      'description': description,
      'certificate_number': certificateNumber,
      'file_path': filePath,
      'download_url': downloadUrl,
      'issued_at': issuedAt.toIso8601String(),
      'expires_at': expiresAt?.toIso8601String(),
      'status': status,
      'event': event?.toJson(),
      'user': user?.toJson(),
    };
  }

  bool get isActive => status == 'active';
  bool get isExpired => status == 'expired';
  bool get isRevoked => status == 'revoked';
  bool get hasExpired {
    final expiry = expiresAt;
    return expiry != null && DateTime.now().isAfter(expiry);
  }

  String get statusText {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'expired':
        return 'Kedaluwarsa';
      case 'revoked':
        return 'Dicabut';
      default:
        return 'Tidak Diketahui';
    }
  }

  String get formattedIssuedDate {
    return '${issuedAt.day}/${issuedAt.month}/${issuedAt.year}';
  }

  String get formattedExpiryDate {
    final expiry = expiresAt;
    if (expiry != null) {
      return '${expiry.day}/${expiry.month}/${expiry.year}';
    }
    return 'Tidak ada masa berlaku';
  }
}
