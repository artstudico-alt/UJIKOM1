// Temporarily simplified notification service without flutter_local_notifications
import '../models/notification.dart' as app_notification;
import 'api_service.dart';

class NotificationService {
  static bool _initialized = false;

  static Future<void> initialize() async {
    if (_initialized) return;
    // TODO: Re-enable when flutter_local_notifications is available
    _initialized = true;
  }

  static Future<List<app_notification.AppNotification>> getNotifications() async {
    try {
      final response = await ApiService.getNotifications();
      if (response['success'] == true) {
        final List<dynamic> notificationsData = response['data'];
        return notificationsData.map((json) => app_notification.AppNotification.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      print('Get notifications error: $e');
      return [];
    }
  }

  static Future<void> showNotification({
    required int id,
    required String title,
    required String body,
    String? payload,
  }) async {
    await initialize();
    // TODO: Implement actual notification when flutter_local_notifications is available
    print('Notification: $title - $body');
  }

  static Future<void> scheduleNotification({
    required int id,
    required String title,
    required String body,
    required DateTime scheduledDate,
    String? payload,
  }) async {
    await initialize();
    // TODO: Implement actual scheduling when flutter_local_notifications is available
    print('Scheduled Notification: $title - $body at $scheduledDate');
  }

  static Future<void> cancelNotification(int id) async {
    // TODO: Implement actual cancellation when flutter_local_notifications is available
    print('Cancel notification: $id');
  }

  static Future<void> cancelAllNotifications() async {
    // TODO: Implement actual cancellation when flutter_local_notifications is available
    print('Cancel all notifications');
  }

  static List<app_notification.AppNotification> filterNotificationsByType(
    List<app_notification.AppNotification> notifications,
    String type,
  ) {
    return notifications.where((notification) => notification.type == type).toList();
  }

  static List<app_notification.AppNotification> sortNotificationsByDate(
    List<app_notification.AppNotification> notifications, {
    bool ascending = false,
  }) {
    notifications.sort((a, b) {
      if (ascending) {
        return a.createdAt.compareTo(b.createdAt);
      } else {
        return b.createdAt.compareTo(a.createdAt);
      }
    });
    return notifications;
  }

  static Map<String, int> getNotificationStats(List<app_notification.AppNotification> notifications) {
    int unread = 0;
    int read = 0;

    for (var notification in notifications) {
      if (notification.isRead) {
        read++;
      } else {
        unread++;
      }
    }
    return {'unread': unread, 'read': read};
  }
}