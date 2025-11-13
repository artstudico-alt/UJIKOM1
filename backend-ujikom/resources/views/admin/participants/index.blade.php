@extends('admin.layouts.app')

@section('title', 'Manajemen Peserta')
@section('page-title', 'Manajemen Peserta')
@section('page-subtitle', 'Kelola peserta berdasarkan event')

@section('content')
<div class="events-container">
    <!-- Header Actions -->
    <div class="page-header mb-4">
        <div class="row align-items-center">
            <div class="col-md-8">
                <div class="d-flex gap-3 flex-wrap">
                    <a href="{{ route('admin.participants.all') }}" class="btn btn-primary">
                        <i class="fas fa-users me-2"></i> Lihat Semua Peserta
                    </a>
                    <button class="btn btn-outline-secondary" onclick="exportParticipants()">
                        <i class="fas fa-download me-2"></i> Ekspor Data
                    </button>
                </div>
            </div>
            <div class="col-md-4">
                <div class="search-box">
                    <div class="input-group">
                        <span class="input-group-text">
                            <i class="fas fa-search"></i>
                        </span>
                        <input type="text" class="form-control" placeholder="Cari event..." id="searchInput">
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Events Grid -->
    <div class="events-grid">
        @forelse($events as $event)
        <div class="event-card" data-event-id="{{ $event->id }}">
            <div class="event-header">
                <div class="event-title">
                    <h5>{{ $event->title }}</h5>
                    <p class="event-description">{{ Str::limit($event->description, 100) }}</p>
                </div>
                <div class="event-status">
                    @if($event->is_active)
                        <span class="badge bg-success">Aktif</span>
                    @else
                        <span class="badge bg-secondary">Draft</span>
                    @endif
                </div>
            </div>
            <div class="event-details">
                <div class="detail-item">
                    <i class="fas fa-calendar"></i>
                    <span>{{ \Carbon\Carbon::parse($event->date)->format('d M Y') }}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-clock"></i>
                    <span>{{ $event->start_time }} - {{ $event->end_time }}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>{{ $event->location }}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-users"></i>
                    <span>{{ $event->event_participants_count }} Peserta</span>
                </div>
            </div>
            <div class="event-actions">
                <a href="{{ route('admin.participants.event', $event->id) }}" class="btn btn-sm btn-primary">
                    <i class="fas fa-users me-1"></i> Lihat Peserta
                </a>
            </div>
        </div>
        @empty
        <div class="alert alert-info w-100">
            <i class="fas fa-info-circle me-2"></i> Belum ada event yang tersedia.
        </div>
        @endforelse
    </div>

    <!-- Pagination -->
    <div class="d-flex justify-content-center mt-4">
        {{ $events->links() }}
    </div>
</div>

<script>
    // Search functionality
    document.getElementById('searchInput').addEventListener('keyup', function() {
        const searchValue = this.value.toLowerCase();
        const eventCards = document.querySelectorAll('.event-card');
        
        eventCards.forEach(card => {
            const title = card.querySelector('.event-title h5').textContent.toLowerCase();
            const description = card.querySelector('.event-description').textContent.toLowerCase();
            
            if (title.includes(searchValue) || description.includes(searchValue)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    });

    // Export functionality
    function exportParticipants() {
        window.location.href = "{{ route('admin.participants.export') }}";
    }
</script>
@endsection