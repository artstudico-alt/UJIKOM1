@extends('admin.layouts.app')

@section('title', 'Admin Dashboard')
@section('page-title', 'Dashboard Admin')
@section('page-subtitle', 'Selamat datang di panel administrasi EventHub')

@push('styles')
<style>
    /* Force override untuk stats cards */
    .stats-card {
        background: white !important;
        border-radius: 12px !important;
        padding: 2rem !important;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1) !important;
        transition: all 0.3s ease !important;
        position: relative !important;
        overflow: hidden !important;
        height: 100% !important;
        border: none !important;
    }
    
    .stats-card::before {
        content: '' !important;
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        height: 4px !important;
        background: #667eea !important;
    }
    
    .stats-card:hover {
        transform: translateY(-4px) !important;
        box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important;
    }
    
    .stats-card.success::before {
        background: #43e97b !important;
    }
    
    .stats-card.warning::before {
        background: #f6c23e !important;
    }
    
    .stats-card.info::before {
        background: #4facfe !important;
    }
    
    .stats-content {
        display: flex !important;
        align-items: center !important;
        gap: 1.5rem !important;
    }
    
    .stats-icon {
        width: 60px !important;
        height: 60px !important;
        border-radius: 50% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 1.5rem !important;
        color: white !important;
        background: #667eea !important;
        flex-shrink: 0 !important;
    }
    
    .stats-card.success .stats-icon {
        background: #43e97b !important;
    }
    
    .stats-card.warning .stats-icon {
        background: #f6c23e !important;
    }
    
    .stats-card.info .stats-icon {
        background: #4facfe !important;
    }
    
    .stats-info {
        flex: 1 !important;
    }
    
    .stats-number {
        font-size: 2.5rem !important;
        font-weight: 700 !important;
        margin: 0 !important;
        color: #2c3e50 !important;
        line-height: 1 !important;
    }
    
    .stats-label {
        font-size: 0.875rem !important;
        color: #6c757d !important;
        margin: 0.5rem 0 !important;
        font-weight: 500 !important;
    }
    
    .stats-trend {
        display: flex !important;
        align-items: center !important;
        gap: 0.5rem !important;
        font-size: 0.75rem !important;
    }
    
    .card {
        border: none !important;
        border-radius: 12px !important;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1) !important;
        background: white !important;
        transition: all 0.3s ease !important;
    }
    
    .card:hover {
        box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important;
        transform: translateY(-2px) !important;
    }
    
    .card-header {
        background: linear-gradient(135deg, #f8f9fc 0%, #ffffff 100%) !important;
        border-bottom: 1px solid #e3e6f0 !important;
        border-radius: 12px 12px 0 0 !important;
        padding: 1.5rem !important;
    }
    
    .card-body {
        padding: 1.5rem !important;
    }
    
    /* TESTING - Force visible changes */
    .stats-card {
        background: linear-gradient(45deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%) !important;
        border: 3px solid #ff6b6b !important;
        transform: rotate(2deg) !important;
    }
    
    .stats-card:nth-child(2) {
        transform: rotate(-2deg) !important;
        background: linear-gradient(45deg, #a8edea 0%, #fed6e3 100%) !important;
    }
    
    .stats-card:nth-child(3) {
        transform: rotate(1deg) !important;
        background: linear-gradient(45deg, #ffecd2 0%, #fcb69f 100%) !important;
    }
    
    .stats-card:nth-child(4) {
        transform: rotate(-1deg) !important;
        background: linear-gradient(45deg, #a8edea 0%, #fed6e3 100%) !important;
    }
    
    .stats-icon {
        background: #ff6b6b !important;
        animation: bounce 1s infinite !important;
    }
    
    @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        60% { transform: translateY(-5px); }
    }
</style>
@endpush

@section('content')
<div class="dashboard-container">
    <!-- TESTING MESSAGE -->
    <div class="alert alert-warning" style="background: #ff6b6b !important; color: white !important; font-size: 1.5rem !important; text-align: center !important; padding: 2rem !important; margin-bottom: 2rem !important;">
        <strong>🎉 PERUBAHAN TAMPILAN ADMIN BERHASIL DITERAPKAN! 🎉</strong><br>
        <small>Jika Anda melihat pesan ini, berarti perubahan CSS sudah berhasil dimuat!</small>
    </div>
    
    <!-- Quick Actions -->
    <div class="quick-actions mb-4">
        <div class="row g-3">
            <div class="col-md-8">
                <div class="d-flex gap-3 flex-wrap">
                    <a href="{{ route('admin.events.create') }}" class="btn btn-primary">
                        <i class="fas fa-plus me-2"></i> Buat Event Baru
                    </a>
                    <a href="#" class="btn btn-outline-primary">
                        <i class="fas fa-users me-2"></i> Kelola Peserta
                    </a>
                    <a href="#" class="btn btn-outline-success">
                        <i class="fas fa-certificate me-2"></i> Kelola Sertifikat
                    </a>
                    <a href="#" class="btn btn-outline-info">
                        <i class="fas fa-chart-bar me-2"></i> Lihat Laporan
                    </a>
                </div>
            </div>
            <div class="col-md-4">
                <div class="text-end">
                    <div class="btn-group" role="group">
                        <button type="button" class="btn btn-outline-secondary active" data-period="today">Hari Ini</button>
                        <button type="button" class="btn btn-outline-secondary" data-period="week">Minggu Ini</button>
                        <button type="button" class="btn btn-outline-secondary" data-period="month">Bulan Ini</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid mb-5">
        <div class="row g-4">
            <div class="col-xl-3 col-md-6">
                <div class="stats-card">
                    <div class="stats-content">
                        <div class="stats-icon">
                            <i class="fas fa-calendar-alt"></i>
                        </div>
                        <div class="stats-info">
                            <h3 class="stats-number">{{ $stats['total_events'] }}</h3>
                            <p class="stats-label">Total Kegiatan</p>
                            <div class="stats-trend">
                                <i class="fas fa-arrow-up text-success"></i>
                                <span class="text-success">+12%</span>
                                <span class="text-muted">dari bulan lalu</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-xl-3 col-md-6">
                <div class="stats-card success">
                    <div class="stats-content">
                        <div class="stats-icon">
                            <i class="fas fa-calendar-check"></i>
                        </div>
                        <div class="stats-info">
                            <h3 class="stats-number">{{ $stats['upcoming_events'] }}</h3>
                            <p class="stats-label">Kegiatan Mendatang</p>
                            <div class="stats-trend">
                                <i class="fas fa-arrow-up text-success"></i>
                                <span class="text-success">+5%</span>
                                <span class="text-muted">dari bulan lalu</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-xl-3 col-md-6">
                <div class="stats-card info">
                    <div class="stats-content">
                        <div class="stats-icon">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stats-info">
                            <h3 class="stats-number">{{ $stats['total_participants'] }}</h3>
                            <p class="stats-label">Total Peserta</p>
                            <div class="stats-trend">
                                <i class="fas fa-arrow-up text-success"></i>
                                <span class="text-success">+8%</span>
                                <span class="text-muted">dari bulan lalu</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-xl-3 col-md-6">
                <div class="stats-card warning">
                    <div class="stats-content">
                        <div class="stats-icon">
                            <i class="fas fa-certificate"></i>
                        </div>
                        <div class="stats-info">
                            <h3 class="stats-number">{{ $stats['certificates_issued'] }}</h3>
                            <p class="stats-label">Sertifikat Terbit</p>
                            <div class="stats-trend">
                                <i class="fas fa-arrow-up text-success"></i>
                                <span class="text-success">+15%</span>
                                <span class="text-muted">dari bulan lalu</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Charts and Recent Activity -->
    <div class="row g-4">
        <!-- Events Chart -->
        <div class="col-xl-8">
            <div class="card">
                <div class="card-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="card-title mb-1">Grafik Kegiatan</h5>
                            <p class="card-subtitle text-muted">Statistik kegiatan per bulan</p>
                        </div>
                        <div class="chart-controls">
                            <div class="btn-group btn-group-sm" role="group">
                                <button type="button" class="btn btn-outline-primary active" data-period="yearly">Tahunan</button>
                                <button type="button" class="btn btn-outline-primary" data-period="monthly">Bulanan</button>
                                <button type="button" class="btn btn-outline-primary" data-period="weekly">Mingguan</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="chart-container">
                        <canvas id="eventsChart" height="300"></canvas>
                    </div>
                </div>
            </div>
        </div>

        <!-- Upcoming Events -->
        <div class="col-xl-4">
            <div class="card">
                <div class="card-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="card-title mb-1">Kegiatan Mendatang</h5>
                            <p class="card-subtitle text-muted">Event yang akan datang</p>
                        </div>
                        <a href="{{ route('admin.events.index') }}" class="btn btn-sm btn-outline-primary">
                            Lihat Semua
                        </a>
                    </div>
                </div>
                <div class="card-body">
                    @if($upcomingEvents->count() > 0)
                        <div class="upcoming-events">
                            @foreach($upcomingEvents as $event)
                                <div class="event-item">
                                    <div class="event-header">
                                        <h6 class="event-title">{{ $event->title }}</h6>
                                        <span class="event-time">{{ $event->date->diffForHumans() }}</span>
                                    </div>
                                    <div class="event-details">
                                        <div class="event-date">
                                            <i class="fas fa-calendar-alt"></i>
                                            <span>{{ $event->date->format('d M Y') }}</span>
                                        </div>
                                        <div class="event-time-range">
                                            <i class="fas fa-clock"></i>
                                            <span>{{ $event->start_time->format('H:i') }} - {{ $event->end_time->format('H:i') }}</span>
                                        </div>
                                        <div class="event-location">
                                            <i class="fas fa-map-marker-alt"></i>
                                            <span>{{ $event->location }}</span>
                                        </div>
                                    </div>
                                    <div class="event-footer">
                                        <div class="event-participants">
                                            <i class="fas fa-users"></i>
                                            <span>{{ $event->eventParticipants->count() }} peserta</span>
                                        </div>
                                        <span class="event-status badge bg-{{ $event->is_active ? 'success' : 'secondary' }}">
                                            {{ $event->is_active ? 'Aktif' : 'Tidak Aktif' }}
                                        </span>
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    @else
                        <div class="empty-state">
                            <div class="empty-icon">
                                <i class="fas fa-calendar-alt"></i>
                            </div>
                            <h6>Belum ada kegiatan</h6>
                            <p class="text-muted">Tidak ada kegiatan yang dijadwalkan</p>
                            <a href="{{ route('admin.events.create') }}" class="btn btn-primary btn-sm">
                                <i class="fas fa-plus me-1"></i> Buat Kegiatan
                            </a>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>

    <!-- Recent Activity -->
    <div class="row mt-4">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="card-title mb-1">Aktivitas Terbaru</h5>
                            <p class="card-subtitle text-muted">Riwayat aktivitas sistem</p>
                        </div>
                        <a href="#" class="btn btn-sm btn-outline-primary">Lihat Semua</a>
                    </div>
                </div>
                <div class="card-body">
                    @if($recentActivities->count() > 0)
                        <div class="activity-timeline">
                            @foreach($recentActivities as $activity)
                                <div class="activity-item">
                                    <div class="activity-icon">
                                        @switch($activity->type)
                                            @case('event_created')
                                                <i class="fas fa-calendar-plus"></i>
                                                @break
                                            @case('participant_registered')
                                                <i class="fas fa-user-plus"></i>
                                                @break
                                            @case('certificate_issued')
                                                <i class="fas fa-certificate"></i>
                                                @break
                                            @default
                                                <i class="fas fa-info-circle"></i>
                                        @endswitch
                                    </div>
                                    <div class="activity-content">
                                        <div class="activity-header">
                                            <h6 class="activity-title">{{ $activity->title }}</h6>
                                            <span class="activity-time">{{ $activity->created_at->diffForHumans() }}</span>
                                        </div>
                                        <p class="activity-description">{{ $activity->description }}</p>
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    @else
                        <div class="empty-state">
                            <div class="empty-icon">
                                <i class="fas fa-history"></i>
                            </div>
                            <h6>Belum ada aktivitas</h6>
                            <p class="text-muted">Tidak ada aktivitas terbaru untuk ditampilkan</p>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<script>
    // Events Chart
    document.addEventListener('DOMContentLoaded', function() {
        // Chart data from PHP (passed as JSON)
        const chartData = @json($chartData);
        
        // Chart configuration
        const ctx = document.getElementById('eventsChart').getContext('2d');
        const eventsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Events',
                    data: chartData.data,
                    backgroundColor: 'rgba(78, 115, 223, 0.5)',
                    borderColor: 'rgba(78, 115, 223, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'nearest'
                }
            }
        });

        // Chart period toggles
        document.querySelectorAll('[data-period]').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Remove active class from all buttons
                document.querySelectorAll('[data-period]').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Update chart with selected period
                const period = this.getAttribute('data-period');
                updateChart(period);
            });
        });

        // Function to update chart data via AJAX
        function updateChart(period) {
            fetch(`/admin/dashboard/chart-data?period=${period}`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            })
            .then(response => response.json())
            .then(data => {
                eventsChart.data.labels = data.labels;
                eventsChart.data.datasets[0].data = data.data;
                eventsChart.update();
            })
            .catch(error => console.error('Error fetching chart data:', error));
        }
    });
</script>
@endpush

@push('styles')
<style>
    .card {
        border: none;
        box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15);
        margin-bottom: 1.5rem;
    }
    
    .card-header {
        background-color: #f8f9fc;
        border-bottom: 1px solid #e3e6f0;
    }
    
    .border-left-primary {
        border-left: 0.25rem solid #4e73df !important;
    }
    
    .border-left-success {
        border-left: 0.25rem solid #1cc88a !important;
    }
    
    .border-left-info {
        border-left: 0.25rem solid #36b9cc !important;
    }
    
    .border-left-warning {
        border-left: 0.25rem solid #f6c23e !important;
    }
    
    .chart-area {
        position: relative;
        height: 20rem;
        width: 100%;
    }
    
    @media (min-width: 1200px) {
        .chart-area {
            height: 25rem;
        }
    }
    
    /* Timeline styling */
    .timeline {
        position: relative;
        padding-left: 3rem;
        margin: 0 0 0 2rem;
        color: #5a5c69;
    }
    
    .timeline:before {
        content: '';
        position: absolute;
        left: 0.75rem;
        top: 0;
        bottom: 0;
        width: 2px;
        background: #e3e6f0;
    }
    
    .timeline-item {
        position: relative;
        padding-bottom: 1.5rem;
    }
    
    .timeline-marker {
        position: absolute;
        left: -3rem;
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 50%;
        background: #fff;
        text-align: center;
        line-height: 2.5rem;
        font-size: 1.2rem;
        z-index: 1;
        box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15);
    }
    
    .timeline-content {
        padding: 1rem 1.5rem;
        background-color: #f8f9fc;
        border-radius: 0.35rem;
        box-shadow: 0 0.15rem 0.5rem rgba(0, 0, 0, 0.05);
    }
    
    .timeline-content h6 {
        color: #4e73df;
        margin-bottom: 0.5rem;
    }
    
    .timeline-item:last-child .timeline-content {
        margin-bottom: 0;
    }
    
    /* Custom scrollbar for dropdowns */
    .dropdown-menu {
        max-height: 300px;
        overflow-y: auto;
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
        .chart-area {
            height: 15rem;
        }
        
        .timeline {
            padding-left: 2rem;
            margin-left: 1rem;
        }
        
        .timeline-marker {
            left: -2.5rem;
            width: 2rem;
            height: 2rem;
            line-height: 2rem;
            font-size: 1rem;
        }
    }
</style>
@endpush
