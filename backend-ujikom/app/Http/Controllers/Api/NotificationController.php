<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class NotificationController extends Controller
{
    /**
     * Get user's notifications
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        $perPage = $request->get('per_page', 15);
        $type = $request->get('type');
        $isRead = $request->get('is_read');

        $query = $user->notifications()->with('event');

        if ($type) {
            $query->where('type', $type);
        }

        if ($isRead !== null) {
            $query->where('is_read', (bool) $isRead);
        }

        $notifications = $query->orderBy('created_at', 'desc')
                             ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $notifications,
        ]);
    }

    /**
     * Get unread notifications count
     */
    public function unreadCount(): JsonResponse
    {
        $user = Auth::user();
        $count = $user->unreadNotifications()->count();

        return response()->json([
            'success' => true,
            'unread_count' => $count,
        ]);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Request $request, $id): JsonResponse
    {
        $user = Auth::user();
        $notification = $user->notifications()->findOrFail($id);

        $notification->markAsRead();

        return response()->json([
            'success' => true,
            'message' => 'Notifikasi telah ditandai sebagai dibaca',
        ]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(): JsonResponse
    {
        $user = Auth::user();
        $user->unreadNotifications()->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Semua notifikasi telah ditandai sebagai dibaca',
        ]);
    }

    /**
     * Mark notification as unread
     */
    public function markAsUnread(Request $request, $id): JsonResponse
    {
        $user = Auth::user();
        $notification = $user->notifications()->findOrFail($id);

        $notification->markAsUnread();

        return response()->json([
            'success' => true,
            'message' => 'Notifikasi telah ditandai sebagai belum dibaca',
        ]);
    }

    /**
     * Delete notification
     */
    public function destroy($id): JsonResponse
    {
        $user = Auth::user();
        $notification = $user->notifications()->findOrFail($id);

        $notification->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notifikasi telah dihapus',
        ]);
    }

    /**
     * Get notification statistics
     */
    public function statistics(): JsonResponse
    {
        $user = Auth::user();
        
        $stats = [
            'total' => $user->notifications()->count(),
            'unread' => $user->unreadNotifications()->count(),
            'by_type' => $user->notifications()
                ->selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->pluck('count', 'type'),
            'recent' => $user->notifications()
                ->where('created_at', '>=', now()->subDays(7))
                ->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Get notifications by type
     */
    public function getByType(Request $request, $type): JsonResponse
    {
        $user = Auth::user();
        $perPage = $request->get('per_page', 15);

        $notifications = $user->notifications()
            ->where('type', $type)
            ->with('event')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $notifications,
        ]);
    }

    /**
     * Get recent notifications (last 5)
     */
    public function recent(): JsonResponse
    {
        $user = Auth::user();
        
        $notifications = $user->notifications()
            ->with('event')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $notifications,
        ]);
    }
}
