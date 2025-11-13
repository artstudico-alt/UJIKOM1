class Event {
  final int id;
  final String title;
  final String description;
  final String location;
  final String date;
  final String? startTime;
  final String? endTime;
  final String? imageUrl;
  final String status;
  final String category;
  final int maxParticipants;
  final int currentParticipants;
  final bool isPaidEvent;
  final double? ticketPrice;
  final DateTime createdAt;
  final DateTime updatedAt;
  final bool? isUserRegistered;

  Event({
    required this.id,
    required this.title,
    required this.description,
    required this.location,
    required this.date,
    this.startTime,
    this.endTime,
    this.imageUrl,
    required this.status,
    required this.category,
    required this.maxParticipants,
    required this.currentParticipants,
    required this.isPaidEvent,
    this.ticketPrice,
    required this.createdAt,
    required this.updatedAt,
    this.isUserRegistered,
  });

  factory Event.fromJson(Map<String, dynamic> json) {
    return Event(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      location: json['location'] ?? '',
      date: json['date'] ?? '',
      startTime: json['start_time'],
      endTime: json['end_time'],
      imageUrl: json['image'],
      status: json['status'] ?? 'active',
      category: json['category'] ?? 'Umum',
      maxParticipants: json['max_participants'] ?? 0,
      currentParticipants:
          json['current_participants_count'] ??
          json['current_participants'] ??
          0,
      isPaidEvent: json['is_paid_event'] ?? false,
      ticketPrice: json['ticket_price']?.toDouble(),
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : DateTime.now(),
      isUserRegistered: json['is_user_registered'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'location': location,
      'date': date,
      'start_time': startTime,
      'end_time': endTime,
      'image': imageUrl,
      'status': status,
      'category': category,
      'max_participants': maxParticipants,
      'current_participants_count': currentParticipants,
      'is_paid_event': isPaidEvent,
      'ticket_price': ticketPrice,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      'is_user_registered': isUserRegistered,
    };
  }

  // Parse date string to DateTime
  DateTime get startDate {
    try {
      if (date.isNotEmpty) {
        return DateTime.parse(date);
      }
      return DateTime.now();
    } catch (e) {
      return DateTime.now();
    }
  }

  bool get isUpcoming => DateTime.now().isBefore(startDate);
  bool get isOngoing =>
      DateTime.now().isAtSameMomentAs(startDate) ||
      (DateTime.now().isAfter(startDate) && status == 'ongoing');
  bool get isCompleted =>
      status == 'completed' ||
      DateTime.now().isAfter(startDate.add(const Duration(days: 1)));
  bool get isFull => currentParticipants >= maxParticipants;
  bool get canRegister => !isFull && status == 'active';

  String get formattedDate {
    try {
      if (date.isNotEmpty) {
        final parsedDate = DateTime.parse(date);
        return '${parsedDate.day}/${parsedDate.month}/${parsedDate.year}';
      }
      return 'Tanggal tidak tersedia';
    } catch (e) {
      return date.isNotEmpty ? date : 'Tanggal tidak tersedia';
    }
  }

  String get formattedStartTime {
    final time = startTime;
    if (time != null && time.isNotEmpty) {
      return time;
    }
    return '00:00';
  }

  String get formattedEndTime {
    final time = endTime;
    if (time != null && time.isNotEmpty) {
      return time;
    }
    return '00:00';
  }
}
