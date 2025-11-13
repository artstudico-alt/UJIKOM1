<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Get all users with pagination and search
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = User::query();
            
            // Search functionality
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%");
                });
            }
            
            // Filter by verification status
            if ($request->has('verification_status')) {
                $status = $request->verification_status;
                if ($status === 'verified') {
                    $query->where('is_verified', true);
                } elseif ($status === 'unverified') {
                    $query->where('is_verified', false);
                }
            }
            
            // Filter by admin status
            if ($request->has('admin_status')) {
                $status = $request->admin_status;
                if ($status === 'admin') {
                    $query->where('is_admin', true);
                } elseif ($status === 'user') {
                    $query->where('is_admin', false);
                }
            }
            
            // Sort functionality
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);
            
            // Pagination
            $perPage = $request->get('per_page', 15);
            $users = $query->paginate($perPage);
            
            return response()->json([
                'success' => true,
                'data' => $users
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memuat data users: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get user details
     */
    public function show($id): JsonResponse
    {
        try {
            $user = User::with(['eventParticipants.event', 'attendances.event', 'certificates.event'])
                ->findOrFail($id);
                
            return response()->json([
                'success' => true,
                'data' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan: ' . $e->getMessage()
            ], 404);
        }
    }
    
    /**
     * Update user information
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);
            
            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|string|max:255',
                'email' => [
                    'sometimes',
                    'email',
                    Rule::unique('users')->ignore($id),
                ],
                'phone' => 'sometimes|nullable|string|max:20',
                'address' => 'sometimes|nullable|string|max:500',
                'education' => 'sometimes|nullable|string|max:100',
                'status' => 'sometimes|in:active,inactive,suspended',
                'is_verified' => 'sometimes|boolean',
                'is_admin' => 'sometimes|boolean',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            $user->update($request->only([
                'name', 'email', 'phone', 'address', 'education', 
                'status', 'is_verified', 'is_admin'
            ]));
            
            return response()->json([
                'success' => true,
                'message' => 'User berhasil diperbarui',
                'data' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui user: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Delete user
     */
    public function destroy($id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);
            
            // Check if user has admin role
            if ($user->is_admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak dapat menghapus user admin'
                ], 403);
            }
            
            // Check if user has related data
            if ($user->eventParticipants()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'User memiliki data event yang terkait'
                ], 400);
            }
            
            $user->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'User berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus user: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Bulk actions on users
     */
    public function bulkAction(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'user_ids' => 'required|array',
                'user_ids.*' => 'exists:users,id',
                'action' => 'required|in:verify,unverify,activate,deactivate,delete'
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            $userIds = $request->user_ids;
            $action = $request->action;
            
            switch ($action) {
                case 'verify':
                    User::whereIn('id', $userIds)->update(['is_verified' => true]);
                    $message = 'Users berhasil diverifikasi';
                    break;
                    
                case 'unverify':
                    User::whereIn('id', $userIds)->update(['is_verified' => false]);
                    $message = 'Users berhasil dibatalkan verifikasi';
                    break;
                    
                case 'activate':
                    User::whereIn('id', $userIds)->update(['status' => 'active']);
                    $message = 'Users berhasil diaktifkan';
                    break;
                    
                case 'deactivate':
                    User::whereIn('id', $userIds)->update(['status' => 'inactive']);
                    $message = 'Users berhasil dinonaktifkan';
                    break;
                    
                case 'delete':
                    // Check if any admin users are being deleted
                    $adminUsers = User::whereIn('id', $userIds)->where('is_admin', true)->count();
                    if ($adminUsers > 0) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Tidak dapat menghapus user admin'
                        ], 403);
                    }
                    
                    User::whereIn('id', $userIds)->delete();
                    $message = 'Users berhasil dihapus';
                    break;
            }
            
            return response()->json([
                'success' => true,
                'message' => $message
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal melakukan bulk action: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get user statistics
     */
    public function statistics(): JsonResponse
    {
        try {
            $stats = [
                'total_users' => User::count(),
                'verified_users' => User::where('is_verified', true)->count(),
                'unverified_users' => User::where('is_verified', false)->count(),
                'admin_users' => User::where('is_admin', true)->count(),
                'active_users' => User::where('status', 'active')->count(),
                'inactive_users' => User::where('status', 'inactive')->count(),
                'suspended_users' => User::where('status', 'suspended')->count(),
                'users_this_month' => User::whereMonth('created_at', now()->month)->count(),
                'users_this_year' => User::whereYear('created_at', now()->year)->count(),
            ];
            
            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memuat statistik users: ' . $e->getMessage()
            ], 500);
        }
    }
}
