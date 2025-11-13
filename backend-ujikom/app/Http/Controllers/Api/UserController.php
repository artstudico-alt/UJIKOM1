<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class UserController extends Controller
{
    /**
     * Get all users (for admin only)
     */
    public function index(Request $request)
    {
        $query = User::query();

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by verification status
        if ($request->filled('verification_status') && $request->verification_status !== 'all') {
            $query->where('is_verified', $request->verification_status === 'verified');
        }

        // Filter by role/admin status
        if ($request->filled('admin_status') && $request->admin_status !== 'all') {
            switch ($request->admin_status) {
                case 'admin':
                    $query->where('role', 'admin');
                    break;
                case 'event_organizer':
                    $query->where('role', 'event_organizer');
                    break;
                case 'user':
                    $query->where('role', 'user');
                    break;
                default:
                    // Backward compatibility: only filter by is_admin if column exists
                    if (Schema::hasColumn('users', 'is_admin')) {
                        $query->where('is_admin', $request->admin_status === 'admin');
                    }
                    break;
            }
        }

        $users = $query->latest()->paginate($request->get('per_page', 15));
            
        return response()->json($users);
    }

    /**
     * Get user details
     */
    public function show(User $user)
    {
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'address' => $user->address,
            'education' => $user->education,
            'status' => $user->status,
            'is_verified' => $user->is_verified,
            'is_admin' => $user->is_admin,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
        ]);
    }

    /**
     * Update user
     */
    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|nullable|string|max:20',
            'address' => 'sometimes|nullable|string|max:500',
            'education' => 'sometimes|nullable|string|max:100',
            'status' => 'sometimes|in:active,inactive,suspended',
            'is_verified' => 'sometimes|boolean',
            'is_admin' => 'sometimes|boolean',
            'role' => 'sometimes|in:admin,event_organizer,user',
        ]);

        $data = $request->only([
            'name', 'phone', 'address', 'education', 'status', 'is_verified'
        ]);

        // Accept is_admin only if column exists (legacy support)
        if ($request->has('is_admin') && Schema::hasColumn('users', 'is_admin')) {
            $data['is_admin'] = (bool) $request->boolean('is_admin');
        }

        // If role is provided, set role (do not touch is_admin if column doesn't exist)
        if ($request->filled('role')) {
            $data['role'] = $request->role;
            // Keep backward compatibility: sync is_admin ONLY if column exists
            if (Schema::hasColumn('users', 'is_admin')) {
                $data['is_admin'] = $request->role === 'admin';
            }
        }

        $user->update($data);

        return response()->json([
            'status' => 'success',
            'message' => 'User updated successfully',
            'data' => $user->fresh()
        ]);
    }

    /**
     * Bulk actions on users
     */
    public function bulkAction(Request $request)
    {
        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
            'action' => 'required|in:delete,activate,deactivate,suspend,make_admin,remove_admin'
        ]);

        $userIds = $request->user_ids;
        $action = $request->action;

        // Prevent admin from performing actions on themselves
        $currentUser = request()->user();
        if ($currentUser && in_array($currentUser->id, $userIds)) {
            return response()->json([
                'status' => 'error',
                'message' => 'You cannot perform actions on your own account'
            ], 400);
        }

        try {
            switch ($action) {
                case 'delete':
                    User::whereIn('id', $userIds)->delete();
                    $message = 'Users deleted successfully';
                    break;

                case 'activate':
                    User::whereIn('id', $userIds)->update(['status' => 'active']);
                    $message = 'Users activated successfully';
                    break;

                case 'deactivate':
                    User::whereIn('id', $userIds)->update(['status' => 'inactive']);
                    $message = 'Users deactivated successfully';
                    break;

                case 'suspend':
                    User::whereIn('id', $userIds)->update(['status' => 'suspended']);
                    $message = 'Users suspended successfully';
                    break;

                case 'make_admin':
                    // Promote to admin by setting role
                    User::whereIn('id', $userIds)->update(['role' => 'admin']);
                    $message = 'Users promoted to admin successfully';
                    break;

                case 'remove_admin':
                    // Remove admin privileges by setting role to user
                    User::whereIn('id', $userIds)->update(['role' => 'user']);
                    $message = 'Admin privileges removed successfully';
                    break;

                default:
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Invalid action'
                    ], 400);
            }

            return response()->json([
                'status' => 'success',
                'message' => $message
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to perform bulk action: ' . $e->getMessage()
            ], 500);
        }
    }
}
