@extends('admin.layouts.app')

@section('title', 'Semua Peserta')
@section('page-title', 'Semua Peserta')
@section('page-subtitle', 'Daftar semua peserta dari seluruh event')

@section('content')
<div class="container-fluid">
    <!-- Header Actions -->
    <div class="page-header mb-4">
        <div class="row align-items-center">
            <div class="col-md-8">
                <div class="d-flex gap-3 flex-wrap">
                    <a href="{{ route('admin.participants.index') }}" class="btn btn-outline-secondary">
                        <i class="fas fa-arrow-left me-2"></i> Kembali ke Daftar Event
                    </a>
                    <button class="btn btn-outline-primary" onclick="exportAllParticipants()">
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
                        <input type="text" class="form-control" placeholder="Cari peserta..." id="searchInput">
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Filter Card -->
    <div class="card mb-4">
        <div class="card-header bg-light">
            <h5 class="mb-0">Filter Peserta</h5>
        </div>
        <div class="card-body">
            <form action="{{ route('admin.participants.all') }}" method="GET" id="filterForm">
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="event_id" class="form-label">Filter berdasarkan Event</label>
                            <select class="form-select" id="event_id" name="event_id" onchange="this.form.submit()">
                                <option value="">Semua Event</option>
                                @foreach($events as $event)
                                <option value="{{ $event->id }}" {{ request('event_id') == $event->id ? 'selected' : '' }}>
                                    {{ $event->title }} ({{ \Carbon\Carbon::parse($event->date)->format('d M Y') }})
                                </option>
                                @endforeach
                            </select>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <!-- Participants Table -->
    <div class="card">
        <div class="card-header bg-light">
            <h5 class="mb-0">Daftar Peserta</h5>
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama</th>
                            <th>Email</th>
                            <th>Event</th>
                            <th>No. Registrasi</th>
                            <th>Tgl Registrasi</th>
                            <th>Status Kehadiran</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($participants as $index => $participant)
                        <tr>
                            <td>{{ $participants->firstItem() + $index }}</td>
                            <td>{{ $participant->participant->name }}</td>
                            <td>{{ $participant->participant->email }}</td>
                            <td>
                                <a href="{{ route('admin.participants.event', $participant->event->id) }}">
                                    {{ $participant->event->title }}
                                </a>
                            </td>
                            <td>{{ $participant->registration_number ?? '-' }}</td>
                            <td>{{ $participant->created_at->format('d M Y H:i') }}</td>
                            <td>
                                @if($participant->is_attendance_verified)
                                    <span class="badge bg-success">Hadir</span>
                                @else
                                    <span class="badge bg-warning">Belum Hadir</span>
                                @endif
                            </td>
                            <td>
                                <div class="btn-group">
                                    <button type="button" class="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                        Aksi
                                    </button>
                                    <ul class="dropdown-menu">
                                        <li><a class="dropdown-item" href="#" onclick="viewParticipant({{ $participant->id }})">Detail</a></li>
                                        <li><a class="dropdown-item" href="#" onclick="markAttendance({{ $participant->id }}, {{ $participant->event->id }})">Tandai Hadir</a></li>
                                        <li><a class="dropdown-item" href="#" onclick="generateCertificate({{ $participant->id }}, {{ $participant->event->id }})">Generate Sertifikat</a></li>
                                        <li><hr class="dropdown-divider"></li>
                                        <li><a class="dropdown-item text-danger" href="#" onclick="removeParticipant({{ $participant->id }}, {{ $participant->event->id }})">Hapus</a></li>
                                    </ul>
                                </div>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="8" class="text-center py-4">
                                <div class="d-flex flex-column align-items-center">
                                    <i class="fas fa-users fa-3x text-muted mb-3"></i>
                                    <h5>Belum ada peserta</h5>
                                    <p class="text-muted">Belum ada peserta yang terdaftar</p>
                                </div>
                            </td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
        <div class="card-footer">
            <div class="d-flex justify-content-center">
                {{ $participants->links() }}
            </div>
        </div>
    </div>
</div>

<script>
    // Search functionality
    document.getElementById('searchInput').addEventListener('keyup', function() {
        const searchValue = this.value.toLowerCase();
        const tableRows = document.querySelectorAll('tbody tr');
        
        tableRows.forEach(row => {
            const name = row.cells[1]?.textContent.toLowerCase() || '';
            const email = row.cells[2]?.textContent.toLowerCase() || '';
            const event = row.cells[3]?.textContent.toLowerCase() || '';
            const regNumber = row.cells[4]?.textContent.toLowerCase() || '';
            
            if (name.includes(searchValue) || email.includes(searchValue) || 
                event.includes(searchValue) || regNumber.includes(searchValue)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });

    // Export functionality
    function exportAllParticipants() {
        const eventId = document.getElementById('event_id').value;
        let url = "{{ route('admin.participants.export') }}";
        
        if (eventId) {
            url += `?event_id=${eventId}`;
        }
        
        window.location.href = url;
    }

    // Participant actions
    function viewParticipant(participantId) {
        // Implement view participant details
        alert('View participant ' + participantId);
    }

    function markAttendance(participantId, eventId) {
        // Implement mark attendance
        if (confirm('Tandai peserta ini sebagai hadir?')) {
            fetch(`/admin/events/${eventId}/participants/${participantId}/attendance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Status kehadiran berhasil diperbarui');
                    location.reload();
                } else {
                    alert('Gagal memperbarui status kehadiran');
                }
            });
        }
    }

    function generateCertificate(participantId, eventId) {
        // Implement generate certificate
        if (confirm('Generate sertifikat untuk peserta ini?')) {
            fetch(`/admin/events/${eventId}/participants/${participantId}/certificate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Sertifikat berhasil dibuat');
                    location.reload();
                } else {
                    alert('Gagal membuat sertifikat');
                }
            });
        }
    }

    function removeParticipant(participantId, eventId) {
        // Implement remove participant
        if (confirm('Apakah Anda yakin ingin menghapus peserta ini?')) {
            fetch(`/admin/events/${eventId}/participants/${participantId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Peserta berhasil dihapus');
                    location.reload();
                } else {
                    alert('Gagal menghapus peserta');
                }
            });
        }
    }
</script>
@endsection