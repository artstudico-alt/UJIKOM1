@extends('admin.layouts.app')

@section('title', 'Events Management')
@section('page-title', 'Manajemen Kegiatan')
@section('page-subtitle', 'Kelola semua kegiatan dan event dalam sistem')

@section('content')
<div class="events-container">
    <!-- Header Actions -->
    <div class="page-header mb-4">
        <div class="row align-items-center">
            <div class="col-md-8">
                <div class="d-flex gap-3 flex-wrap">
        <a href="{{ route('admin.events.create') }}" class="btn btn-primary">
                        <i class="fas fa-plus me-2"></i> Buat Kegiatan Baru
                    </a>
                    <button class="btn btn-outline-secondary" onclick="exportEvents()">
                        <i class="fas fa-download me-2"></i> Ekspor Data
                    </button>
                    <div class="btn-group" role="group">
                        <button type="button" class="btn btn-outline-secondary active" data-filter="all">Semua</button>
                        <button type="button" class="btn btn-outline-secondary" data-filter="active">Aktif</button>
                        <button type="button" class="btn btn-outline-secondary" data-filter="upcoming">Mendatang</button>
                        <button type="button" class="btn btn-outline-secondary" data-filter="past">Selesai</button>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="search-box">
                    <div class="input-group">
                        <span class="input-group-text">
                            <i class="fas fa-search"></i>
                        </span>
                        <input type="text" class="form-control" placeholder="Cari kegiatan..." id="searchInput">
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
                            <span class="badge bg-secondary">Tidak Aktif</span>
                                    @endif
                    </div>
                </div>

                <div class="event-details">
                    <div class="event-date">
                        <i class="fas fa-calendar-alt"></i>
                        <div>
                            <span class="date">{{ $event->date->format('d M Y') }}</span>
                            <span class="time">{{ $event->start_time->format('H:i') }} - {{ $event->end_time->format('H:i') }}</span>
                        </div>
                    </div>

                    <div class="event-location">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>{{ $event->location }}</span>
                    </div>

                    <div class="event-participants">
                        <i class="fas fa-users"></i>
                        <div>
                            <span class="count">{{ $event->event_participants_count }} / {{ $event->max_participants ?? '∞' }}</span>
                            <span class="label">peserta</span>
                        </div>
                    </div>
                </div>

                <div class="event-footer">
                    <div class="event-registration">
                                    @if($event->date->isPast())
                            <span class="text-muted small">Selesai</span>
                                    @elseif($event->registration_deadline->isPast())
                            <span class="text-warning small">Pendaftaran Ditutup</span>
                                    @else
                            <span class="text-success small">Pendaftaran Dibuka</span>
                                    @endif
                    </div>

                    <div class="event-actions">
                        <a href="{{ route('admin.events.show', $event) }}" class="btn btn-sm btn-outline-primary" title="Lihat Detail">
                                            <i class="fas fa-eye"></i>
                                        </a>
                        <a href="{{ route('admin.events.edit', $event) }}" class="btn btn-sm btn-outline-warning" title="Edit">
                                            <i class="fas fa-edit"></i>
                                        </a>
                                        <form action="{{ route('admin.events.destroy', $event) }}" method="POST" class="d-inline">
                                            @csrf
                                            @method('DELETE')
                            <button type="submit" class="btn btn-sm btn-outline-danger delete-btn" title="Hapus">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </form>
                                    </div>
                </div>
            </div>
        @empty
            <div class="empty-events">
                <div class="empty-icon">
                    <i class="fas fa-calendar-alt"></i>
                </div>
                <h5>Belum ada kegiatan</h5>
                <p class="text-muted">Mulai dengan membuat kegiatan pertama Anda</p>
                <a href="{{ route('admin.events.create') }}" class="btn btn-primary">
                    <i class="fas fa-plus me-2"></i> Buat Kegiatan
                </a>
            </div>
        @endforelse
    </div>

    <!-- Pagination -->
    @if($events->hasPages())
        <div class="pagination-wrapper mt-4">
            {{ $events->links() }}
        </div>
    @endif
</div>
@endsection

@push('styles')
<style>
    /* Events Grid */
    .events-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
    }

    .event-card {
        background: white;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow);
        transition: var(--transition);
        overflow: hidden;
        border: 1px solid #e3e6f0;
    }

    .event-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
        border-color: var(--primary-color);
    }

    .event-header {
        padding: 1.5rem 1.5rem 1rem;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
    }

    .event-title h5 {
        font-size: 1.1rem;
        font-weight: 700;
        color: #1a1a1a;
        margin: 0 0 0.5rem 0;
        line-height: 1.3;
        text-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }

    .event-description {
        font-size: 0.875rem;
        color: #2d3748;
        margin: 0;
        line-height: 1.4;
        font-weight: 500;
    }

    .event-status .badge {
        font-size: 0.75rem;
        padding: 0.375rem 0.75rem;
    }

    .event-details {
        padding: 0 1.5rem 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .event-details > div {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 0.9rem;
        font-weight: 600;
    }

    .event-details i {
        width: 18px;
        color: var(--primary-color);
        text-align: center;
        font-size: 1rem;
    }

    .event-date div {
        display: flex;
        flex-direction: column;
    }

    .event-date .date {
        font-weight: 700;
        color: #1a1a1a;
        font-size: 0.9rem;
    }

    .event-date .time {
        font-size: 0.8rem;
        color: #4a5568;
        font-weight: 600;
    }

    .event-location span {
        color: #4a5568;
        font-weight: 600;
    }

    .event-participants div {
        display: flex;
        flex-direction: column;
    }

    .event-participants .count {
        font-weight: 700;
        color: #1a1a1a;
        font-size: 0.9rem;
    }

    .event-participants .label {
        font-size: 0.8rem;
        color: #4a5568;
        font-weight: 600;
    }

    .event-footer {
        padding: 1rem 1.5rem 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid #f1f3f4;
        background: #f8f9fc;
    }

    .event-registration {
        font-size: 0.8rem;
        font-weight: 700;
    }

    .event-registration .text-success {
        color: #16a34a !important;
        font-weight: 700;
    }

    .event-registration .text-warning {
        color: #d97706 !important;
        font-weight: 700;
    }

    .event-registration .text-muted {
        color: #6b7280 !important;
        font-weight: 700;
    }

    .event-actions {
        display: flex;
        gap: 0.5rem;
    }

    .event-actions .btn {
        width: 36px;
        height: 36px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        font-weight: 600;
        transition: all 0.2s ease;
    }

    .event-actions .btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    /* Empty State */
    .empty-events {
        grid-column: 1 / -1;
        text-align: center;
        padding: 4rem 2rem;
        background: white;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow);
    }

    .empty-events .empty-icon {
        width: 80px;
        height: 80px;
        background: #f8f9fc;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1.5rem;
        font-size: 2rem;
        color: #6c757d;
    }

    .empty-events h5 {
        color: #1a1a1a;
        margin-bottom: 0.5rem;
        font-weight: 700;
        font-size: 1.2rem;
    }

    .empty-events p {
        margin-bottom: 2rem;
        color: #4a5568;
        font-weight: 600;
        font-size: 1rem;
    }

    /* Search Box */
    .search-box .input-group-text {
        background: white;
        border-right: none;
        color: #4a5568;
        font-weight: 600;
    }

    .search-box .form-control {
        border-left: none;
        font-weight: 600;
        color: #1a1a1a;
    }

    .search-box .form-control:focus {
        border-left: none;
        box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        border-color: var(--primary-color);
    }

    .search-box .form-control::placeholder {
        color: #6b7280;
        font-weight: 500;
    }

    /* Filter Buttons */
    .btn-group .btn {
        font-size: 0.9rem;
        padding: 0.6rem 1.2rem;
        font-weight: 600;
        color: #4a5568;
        border-color: #d1d5db;
    }

    .btn-group .btn.active {
        background-color: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
        font-weight: 700;
    }

    .btn-group .btn:hover {
        background-color: #f3f4f6;
        color: #1a1a1a;
        border-color: #9ca3af;
    }

    /* Pagination */
    .pagination-wrapper {
        display: flex;
        justify-content: center;
    }

    /* Page Header Improvements */
    .page-header h1, .page-header h2, .page-header h3 {
        color: #1a1a1a;
        font-weight: 700;
    }

    .page-header .btn {
        font-weight: 600;
        color: white;
    }

    .page-header .btn-outline-secondary {
        color: #4a5568;
        border-color: #d1d5db;
        font-weight: 600;
    }

    .page-header .btn-outline-secondary:hover {
        background-color: #f3f4f6;
        color: #1a1a1a;
        border-color: #9ca3af;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .events-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
        }

        .page-header .row {
            flex-direction: column;
            gap: 1rem;
        }

        .page-header .col-md-8,
        .page-header .col-md-4 {
            width: 100%;
        }

        .event-title h5 {
            font-size: 1rem;
        }

        .event-description {
            font-size: 0.8rem;
        }
    }
</style>
@endpush

@push('scripts')
<script>
    // Search functionality
    document.getElementById('searchInput').addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const eventCards = document.querySelectorAll('.event-card');

        eventCards.forEach(card => {
            const title = card.querySelector('.event-title h5').textContent.toLowerCase();
            const description = card.querySelector('.event-description').textContent.toLowerCase();

            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });

    // Filter functionality
    document.querySelectorAll('[data-filter]').forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            document.querySelectorAll('[data-filter]').forEach(btn => {
                btn.classList.remove('active');
            });

            // Add active class to clicked button
            this.classList.add('active');

            const filter = this.getAttribute('data-filter');
            const eventCards = document.querySelectorAll('.event-card');

            eventCards.forEach(card => {
                const status = card.querySelector('.event-status .badge').textContent.toLowerCase();
                const registration = card.querySelector('.event-registration span').textContent.toLowerCase();

                let show = false;

                switch(filter) {
                    case 'all':
                        show = true;
                        break;
                    case 'active':
                        show = status === 'aktif';
                        break;
                    case 'upcoming':
                        show = registration === 'pendaftaran dibuka';
                        break;
                    case 'past':
                        show = registration === 'selesai';
                        break;
                }

                card.style.display = show ? 'block' : 'none';
            });
        });
    });

    // Export functionality
    function exportEvents() {
        // Implement export functionality here
        console.log('Export events functionality');
    }
</script>
@endpush
