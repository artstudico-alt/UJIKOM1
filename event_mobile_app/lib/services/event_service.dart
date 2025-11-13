import '../models/event.dart';
import '../models/event_registration.dart';
import 'api_service.dart';

class EventService {
  static Future<List<Event>> getEvents({
    String? search,
    String? status,
    int page = 1,
    int limit = 10,
  }) async {
    try {
      final response = await ApiService.getEvents(
        search: search,
        status: status,
        page: page,
        limit: limit,
      );

      if (response['status'] == 'success') {
        // Backend returns EventResource::collection() which wraps data
        final data = response['data'];
        if (data is List) {
          return data.map((json) => Event.fromJson(json)).toList();
        } else if (data is Map && data.containsKey('data')) {
          final List<dynamic> eventsData = data['data'];
          return eventsData.map((json) => Event.fromJson(json)).toList();
        }
        return [];
      }
      return [];
    } catch (e) {
      print('Get events error: $e');
      return [];
    }
  }

  static Future<Event?> getEvent(int eventId) async {
    try {
      final response = await ApiService.getEvent(eventId);

      if (response['status'] == 'success') {
        return Event.fromJson(response['data']);
      }
      return null;
    } catch (e) {
      print('Get event error: $e');
      return null;
    }
  }

  static Future<bool> registerForEvent(int eventId, {String? notes}) async {
    try {
      final response = await ApiService.registerForEvent(eventId, notes: notes);
      return response['status'] == 'success';
    } catch (e) {
      print('Register for event error: $e');
      return false;
    }
  }

  static Future<List<EventRegistration>> getUserRegistrations() async {
    try {
      final response = await ApiService.getUserRegistrations();

      if (response['status'] == 'success') {
        final List<dynamic> registrationsData = response['data'];
        return registrationsData
            .map((json) => EventRegistration.fromJson(json))
            .toList();
      }
      return [];
    } catch (e) {
      print('Get user registrations error: $e');
      return [];
    }
  }

  static Future<bool> cancelRegistration(int registrationId) async {
    try {
      final response = await ApiService.cancelRegistration(registrationId);
      return response['status'] == 'success';
    } catch (e) {
      print('Cancel registration error: $e');
      return false;
    }
  }

  static List<Event> filterEventsByStatus(List<Event> events, String status) {
    switch (status) {
      case 'upcoming':
        return events.where((event) => event.isUpcoming).toList();
      case 'ongoing':
        return events.where((event) => event.isOngoing).toList();
      case 'completed':
        return events.where((event) => event.isCompleted).toList();
      case 'active':
        return events.where((event) => event.status == 'active').toList();
      case 'cancelled':
        return events.where((event) => event.status == 'cancelled').toList();
      default:
        return events;
    }
  }

  static List<Event> searchEvents(List<Event> events, String query) {
    if (query.isEmpty) return events;

    final lowercaseQuery = query.toLowerCase();
    return events.where((event) {
      return event.title.toLowerCase().contains(lowercaseQuery) ||
          event.description.toLowerCase().contains(lowercaseQuery) ||
          event.location.toLowerCase().contains(lowercaseQuery);
    }).toList();
  }

  static List<Event> sortEvents(List<Event> events, String sortBy) {
    switch (sortBy) {
      case 'date_asc':
        events.sort((a, b) => a.startDate.compareTo(b.startDate));
        break;
      case 'date_desc':
        events.sort((a, b) => b.startDate.compareTo(a.startDate));
        break;
      case 'title_asc':
        events.sort((a, b) => a.title.compareTo(b.title));
        break;
      case 'title_desc':
        events.sort((a, b) => b.title.compareTo(a.title));
        break;
      case 'participants_asc':
        events.sort(
          (a, b) => a.currentParticipants.compareTo(b.currentParticipants),
        );
        break;
      case 'participants_desc':
        events.sort(
          (a, b) => b.currentParticipants.compareTo(a.currentParticipants),
        );
        break;
    }
    return events;
  }
}
