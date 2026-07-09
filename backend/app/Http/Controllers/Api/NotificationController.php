<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get user's notifications with pagination.
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 20);
        $type = $request->input('type');
        $priority = $request->input('priority');
        $unreadOnly = $request->boolean('unread_only', false);

        $query = $request->user()
            ->notifications()
            ->with(['createdBy', 'subCity'])
            ->orderByDesc('created_at');

        if ($type) {
            $query->ofType($type);
        }

        if ($priority) {
            $query->ofPriority($priority);
        }

        if ($unreadOnly) {
            $query->unread();
        }

        $notifications = $query->paginate($perPage);

        return response()->json($notifications);
    }

    /**
     * Get unread notification count.
     */
    public function unreadCount(Request $request)
    {
        $count = $request->user()
            ->notifications()
            ->unread()
            ->count();

        return response()->json(['count' => $count]);
    }

    /**
     * Get recent notifications (for dropdown).
     */
    public function recent(Request $request)
    {        
        $limit = $request->input('limit', 5);

        $notifications = $request->user()
            ->notifications()
            ->with(['createdBy', 'subCity'])
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();

        $unreadCount = $request->user()
            ->notifications()
            ->unread()
            ->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Display the specified notification.
     */
    public function show(Request $request, string $id)
    {
        $notification = $request->user()
            ->notifications()
            ->with(['createdBy', 'subCity'])
            ->findOrFail($id);

        // Mark as read when viewed
        if ($notification->isUnread()) {
            $notification->markAsRead();
        }

        return response()->json(['data' => $notification]);
    }

    /**
     * Mark notification as read.
     */
    public function markAsRead(Request $request, string $id)
    {
        $notification = $request->user()
            ->notifications()
            ->findOrFail($id);

        $notification->markAsRead();

        return response()->json([
            'message' => 'Notification marked as read',
            'data' => $notification,
        ]);
    }

    /**
     * Mark notification as unread.
     */
    public function markAsUnread(Request $request, string $id)
    {
        $notification = $request->user()
            ->notifications()
            ->findOrFail($id);

        $notification->markAsUnread();

        return response()->json([
            'message' => 'Notification marked as unread',
            'data' => $notification,
        ]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request)
    {
        $count = $request->user()
            ->notifications()
            ->unread()
            ->update(['read_at' => now()]);

        ActivityLog::log('mark_all_notifications_read', 'notifications', $request->user());

        return response()->json([
            'message' => 'All notifications marked as read',
            'count' => $count,
        ]);
    }

    /**
     * Delete notification.
     */
    public function destroy(Request $request, string $id)
    {
        $notification = $request->user()
            ->notifications()
            ->findOrFail($id);

        $notification->delete();

        return response()->json(['message' => 'Notification deleted']);
    }

    /**
     * Delete all read notifications.
     */
    public function deleteAllRead(Request $request)
    {
        $count = $request->user()
            ->notifications()
            ->read()
            ->delete();

        ActivityLog::log('delete_read_notifications', 'notifications', $request->user());

        return response()->json([
            'message' => 'All read notifications deleted',
            'count' => $count,
        ]);
    }

    /**
     * Delete all notifications.
     */
    public function deleteAll(Request $request)
    {
        $count = $request->user()
            ->notifications()
            ->delete();

        ActivityLog::log('delete_all_notifications', 'notifications', $request->user());

        return response()->json([
            'message' => 'All notifications deleted',
            'count' => $count,
        ]);
    }

    /**
     * Get notification statistics.
     */
    public function statistics(Request $request)
    {
        $user = $request->user();

        $stats = [
            'total' => $user->notifications()->count(),
            'unread' => $user->notifications()->unread()->count(),
            'read' => $user->notifications()->read()->count(),
            'today' => $user->notifications()->whereDate('created_at', today())->count(),
            'this_week' => $user->notifications()->recent(7)->count(),
            'by_type' => $user->notifications()
                ->selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->pluck('count', 'type'),
            'by_priority' => $user->notifications()
                ->selectRaw('priority, COUNT(*) as count')
                ->groupBy('priority')
                ->pluck('count', 'priority'),
        ];

        return response()->json($stats);
    }
}
