<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\User;
use App\Models\EventParticipant;
use App\Models\Attendance;
use App\Models\Certificate;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\EventsExport;
use App\Exports\ParticipantsExport;
use App\Exports\UsersExport;

class DashboardController extends Controller
{
    /**
     * Get admin dashboard statistics
     */
    public function statistics(): JsonResponse
    {
        try {
            $currentMonth = Carbon::now()->month;
            $currentYear = Carbon::now()->year;
            
            // Total counts
            $totalEvents = Event::count();
            $totalUsers = User::count();
            $totalParticipants = EventParticipant::count();
            $totalAttendances = Attendance::count();
            $totalCertificates = Certificate::count();
            
            // Monthly statistics
            $monthlyEvents = Event::whereMonth('date', $currentMonth)
                ->whereYear('date', $currentYear)
                ->count();
                
            $monthlyParticipants = EventParticipant::whereMonth('created_at', $currentMonth)
                ->whereYear('created_at', $currentYear)
                ->count();
                
            $monthlyAttendances = Attendance::whereMonth('created_at', $currentMonth)
                ->whereYear('created_at', $currentYear)
                ->count();
                
            // Upcoming events
            $upcomingEvents = Event::where('date', '>=', Carbon::now()->toDateString())
                ->orderBy('date')
                ->take(5)
                ->get(['id', 'title', 'date', 'start_time', 'location']);
                
            // Recent activities
            $recentActivities = EventParticipant::with(['event', 'participant'])
                ->latest()
                ->take(10)
                ->get();
                
            // Top events by participants
            $topEvents = Event::withCount('participants')
                ->orderBy('participants_count', 'desc')
                ->take(10)
                ->get(['id', 'title', 'date', 'participants_count']);
                
            // User statistics
            $verifiedUsers = User::where('is_verified', true)->count();
            $unverifiedUsers = User::where('is_verified', false)->count();
            $adminUsers = User::where('is_admin', true)->count();
            
            // Event status statistics
            $activeEvents = Event::where('date', '>=', Carbon::now()->toDateString())->count();
            $pastEvents = Event::where('date', '<', Carbon::now()->toDateString())->count();
            $draftEvents = Event::where('is_active', false)->count();
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'total_events' => $totalEvents,
                    'total_users' => $totalUsers,
                    'total_participants' => $totalParticipants,
                    'total_certificates' => $totalCertificates,
                    'upcoming_events' => $upcomingEvents,
                    'recent_activities' => $recentActivities,
                    'top_events' => $topEvents,
                    'verified_users' => $verifiedUsers,
                    'unverified_users' => $unverifiedUsers,
                    'admin_users' => $adminUsers,
                    'active_events' => $activeEvents,
                    'past_events' => $pastEvents,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memuat data dashboard: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get chart data for admin dashboard
     */
    public function chartData(): JsonResponse
    {
        try {
            $currentYear = Carbon::now()->year;
            
            // Monthly events chart
            $monthlyEventsData = Event::selectRaw('MONTH(date) as month, COUNT(*) as count')
                ->whereYear('date', $currentYear)
                ->groupBy('month')
                ->orderBy('month')
                ->get()
                ->map(function ($item) {
                    return [
                        'month' => Carbon::create()->month($item->month)->format('M'),
                        'count' => $item->count
                    ];
                });
                
            // Monthly participants chart
            $monthlyParticipantsData = EventParticipant::selectRaw('MONTH(created_at) as month, COUNT(*) as count')
                ->whereYear('created_at', $currentYear)
                ->groupBy('month')
                ->orderBy('month')
                ->get()
                ->map(function ($item) {
                    return [
                        'month' => Carbon::create()->month($item->month)->format('M'),
                        'count' => $item->count
                    ];
                });
                
            // Event status chart
            $eventStatusData = Event::selectRaw('is_active, COUNT(*) as count')
                ->groupBy('is_active')
                ->get()
                ->map(function ($item) {
                    return [
                        'status' => $item->is_active ? 'Active' : 'Inactive',
                        'count' => $item->count
                    ];
                });
                
            // User registration trend
            $userRegistrationData = User::selectRaw('MONTH(created_at) as month, COUNT(*) as count')
                ->whereYear('created_at', $currentYear)
                ->groupBy('month')
                ->orderBy('month')
                ->get()
                ->map(function ($item) {
                    return [
                        'month' => Carbon::create()->month($item->month)->format('M'),
                        'count' => $item->count
                    ];
                });
                
            return response()->json([
                'status' => 'success',
                'data' => [
                    'monthly_events' => $monthlyEventsData,
                    'monthly_participants' => $monthlyParticipantsData,
                    'event_status' => $eventStatusData,
                    'user_registration' => $userRegistrationData,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memuat data chart: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Export events data
     */
    public function exportEvents(Request $request)
    {
        try {
            $format = $request->get('format', 'xlsx');
            $filename = 'events_' . date('Y-m-d_H-i-s') . '.' . $format;
            
            if ($format === 'csv') {
                return Excel::download(new EventsExport, $filename, \Maatwebsite\Excel\Excel::CSV);
            }
            
            return Excel::download(new EventsExport, $filename, \Maatwebsite\Excel\Excel::XLSX);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal export data events: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Export participants data
     */
    public function exportParticipants(Request $request)
    {
        try {
            $format = $request->get('format', 'xlsx');
            $filename = 'participants_' . date('Y-m-d_H-i-s') . '.' . $format;
            
            if ($format === 'csv') {
                return Excel::download(new ParticipantsExport, $filename, \Maatwebsite\Excel\Excel::CSV);
            }
            
            return Excel::download(new ParticipantsExport, $filename, \Maatwebsite\Excel\Excel::XLSX);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal export data participants: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Export users data
     */
    public function exportUsers(Request $request)
    {
        try {
            $format = $request->get('format', 'xlsx');
            $filename = 'users_' . date('Y-m-d_H-i-s') . '.' . $format;
            
            if ($format === 'csv') {
                return Excel::download(new UsersExport, $filename, \Maatwebsite\Excel\Excel::CSV);
            }
            
            return Excel::download(new UsersExport, $filename, \Maatwebsite\Excel\Excel::XLSX);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal export data users: ' . $e->getMessage()
            ], 500);
        }
    }
}
