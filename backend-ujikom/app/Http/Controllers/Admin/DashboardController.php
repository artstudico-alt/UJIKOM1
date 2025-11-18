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
            \Log::info('📊 Dashboard Stats: Starting to fetch statistics...');

            $currentMonth = Carbon::now()->month;
            $currentYear = Carbon::now()->year;

            // Total counts
            $totalEvents = Event::count();
            $totalUsers = User::count();
            $totalParticipants = EventParticipant::count();

            \Log::info('📊 Dashboard Stats: Basic counts', [
                'total_events' => $totalEvents,
                'total_users' => $totalUsers,
                'total_participants' => $totalParticipants
            ]);
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
            $completedEvents = Event::where('date', '<', Carbon::now()->toDateString())->count();

            // Organizer vs Admin events
            $organizerEvents = Event::where('organizer_type', 'organizer')->count();
            $adminEvents = Event::where('organizer_type', 'admin')->orWhereNull('organizer_type')->count();

            // Pending approvals (events waiting for admin approval)
            $pendingApprovals = Event::where('status', 'pending_approval')
                ->where('organizer_type', 'organizer')
                ->count();

            // Published events
            $publishedEvents = Event::whereIn('status', ['published', 'approved'])->count();

            // Revenue calculation (this month)
            $monthlyRevenue = Event::whereMonth('date', $currentMonth)
                ->whereYear('date', $currentYear)
                ->whereNotNull('price')
                ->sum(DB::raw('price * COALESCE((SELECT COUNT(*) FROM event_participants WHERE event_participants.event_id = events.id), 0)'));

            // New users this month
            $newUsersThisMonth = User::whereMonth('created_at', $currentMonth)
                ->whereYear('created_at', $currentYear)
                ->count();

            // New events this month
            $newEventsThisMonth = Event::whereMonth('created_at', $currentMonth)
                ->whereYear('created_at', $currentYear)
                ->count();

            $responseData = [
                // Main stats for dashboard cards
                'total_events' => $totalEvents,
                'total_users' => $totalUsers,
                'total_participants' => $totalParticipants,
                'pending_approvals' => $pendingApprovals,

                // Organizer vs Admin breakdown
                'total_organizer_events' => $organizerEvents,
                'total_admin_events' => $adminEvents,

                // Event status breakdown
                'published_events' => $publishedEvents,
                'active_events' => $activeEvents,
                'completed_events' => $completedEvents,

                // Monthly statistics
                'new_users_this_month' => $newUsersThisMonth,
                'new_events_this_month' => $newEventsThisMonth,
                'revenue_this_month' => $monthlyRevenue,

                // Additional data for charts/tables
                'total_certificates' => $totalCertificates,
                'upcoming_events' => $upcomingEvents,
                'recent_activities' => $recentActivities,
                'top_events' => $topEvents,
                'verified_users' => $verifiedUsers,
                'unverified_users' => $unverifiedUsers,
                'admin_users' => $adminUsers,
            ];

            \Log::info('✅ Dashboard Stats: Successfully calculated', $responseData);

            return response()->json([
                'status' => 'success',
                'data' => $responseData
            ]);
        } catch (\Exception $e) {
            \Log::error('❌ Dashboard Stats: Error occurred', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memuat data dashboard: ' . $e->getMessage(),
                'debug' => config('app.debug') ? [
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ] : null
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

            // Nama bulan dalam bahasa Indonesia
            $monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

            // 1. Jumlah kegiatan yang terlaksana setiap bulan (Januari - Desember)
            $eventsPerMonthRaw = Event::selectRaw('MONTH(date) as month, COUNT(*) as count')
                ->whereYear('date', $currentYear)
                ->where('date', '<', Carbon::now()->toDateString()) // Hanya event yang sudah terlaksana
                ->groupBy('month')
                ->orderBy('month')
                ->pluck('count', 'month')
                ->toArray();

            // Fill semua bulan dengan 0 jika tidak ada data
            $eventsPerMonth = [];
            for ($i = 1; $i <= 12; $i++) {
                $eventsPerMonth[] = [
                    'month' => $monthNames[$i - 1],
                    'count' => $eventsPerMonthRaw[$i] ?? 0
                ];
            }

            // 2. Jumlah peserta yang mengikuti kegiatan setiap bulan (yang sudah hadir)
            $participantsPerMonthRaw = DB::table('attendances')
                ->join('events', 'attendances.event_id', '=', 'events.id')
                ->selectRaw('MONTH(events.date) as month, COUNT(DISTINCT attendances.user_id) as count')
                ->whereYear('events.date', $currentYear)
                ->groupBy('month')
                ->orderBy('month')
                ->pluck('count', 'month')
                ->toArray();

            // Fill semua bulan dengan 0 jika tidak ada data
            $participantsPerMonth = [];
            for ($i = 1; $i <= 12; $i++) {
                $participantsPerMonth[] = [
                    'month' => $monthNames[$i - 1],
                    'count' => $participantsPerMonthRaw[$i] ?? 0
                ];
            }

            // 3. Sepuluh kegiatan dengan jumlah peserta terbanyak
            $topEvents = Event::select('events.id', 'events.title')
                ->leftJoin('attendances', 'events.id', '=', 'attendances.event_id')
                ->selectRaw('events.title as name, COUNT(DISTINCT attendances.user_id) as participants')
                ->groupBy('events.id', 'events.title')
                ->orderByDesc('participants')
                ->limit(10)
                ->get()
                ->map(function ($item) {
                    return [
                        'name' => strlen($item->name) > 30 ? substr($item->name, 0, 27) . '...' : $item->name,
                        'participants' => (int) $item->participants
                    ];
                })
                ->toArray();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'eventsPerMonth' => $eventsPerMonth,
                    'participantsPerMonth' => $participantsPerMonth,
                    'topEvents' => $topEvents,
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('❌ Chart Data Error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

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
