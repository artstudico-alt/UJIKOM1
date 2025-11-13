@extends('admin.layouts.app')

@section('title', 'Peserta Event')
@section('page-title', 'Peserta Event: {{ $event->title }}')
@section('page-subtitle', 'Daftar peserta yang terdaftar pada event ini')

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
                    <button class="btn btn-outline-primary" onclick="exportEventParticipants({{ $event->id }})">
                        <i class="fas fa-download me-2"></i> Ekspor Data Peserta
                    </button>
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addParticipantModal">
                        <i class="fas fa-plus me-2"></i> Tambah Peserta
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

    <!-- Event Info Card -->
    <div class="card mb-4">
        <div class="card-header bg-light">
            <h5 class="mb-0">Informasi Event</h5>
        </div>
        <div class="card-body">
            <div class="row">
                <div class="col-md-6">
                    <table class="table table-sm table-borderless">
                        <tr>
                            <th width="150">Nama Event</th>
                            <td>{{ $event->title }}</td>
                        </tr>
                        <tr>
                            <th>Tanggal</th>
                            <td>{{ \Carbon\Carbon::parse($event->date)->format('d M Y') }}</td>
                        </tr>
                        <tr>
                            <th>Waktu</th>
                            <td>{{ $event->start_time }} - {{ $event->end_time }}</td>
                        </tr>
                    </table>
                </div>
                <div class="col-md-6">
                    <table class="table table-sm table-borderless">
                        <tr>
                            <th width="150">Lokasi</th>
                            <td>{{ $event->location }}</td>
                        </tr>
                        <tr>
                            <th>Jumlah Peserta</th>
                            <td>{{ $participants->total() }} orang</td>
                        </tr>
                        <tr>
                            <th>Status</th>
                            <td>
                                @if($event->is_active)
                                    <span class="badge bg-success">Aktif</span>
                                @else
                                    <span class="badge bg-secondary">Draft</span>
                                @endif
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
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
                                        <li><a class="dropdown-item" href="#" onclick="markAttendance({{ $participant->id }})">Tandai Hadir</a></li>
                                        <li><a class="dropdown-item" href="#" onclick="generateCertificate({{ $participant->id }})">Generate Sertifikat</a></li>
                                        <li><hr class="dropdown-divider"></li>
                                        <li><a class="dropdown-item text-danger" href="#" onclick="removeParticipant({{ $participant->id }})">Hapus</a></li>
                                    </ul>
                                </div>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="7" class="text-center py-4">
                                <div class="d-flex flex-column align-items-center">
                                    <i class="fas fa-users fa-3x text-muted mb-3"></i>
                                    <h5>Belum ada peserta</h5>
                                    <p class="text-muted">Belum ada peserta yang terdaftar pada event ini</p>
                                    <button class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#addParticipantModal">
                                        <i class="fas fa-plus me-2"></i> Tambah Peserta
                                    </button>
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

<!-- Add Participant Modal -->
<div class="modal fade" id="addParticipantModal" tabindex="-1" aria-labelledby="addParticipantModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="addParticipantModalLabel">Tambah Peserta</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form action="{{ route('admin.events.add-participant', $event->id) }}" method="POST">
                @csrf
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="email" class="form-label">Email Peserta</label>
                        <input type="email" class="form-control" id="email" name="email" required>
                        <div class="form-text">Masukkan email peserta yang sudah terdaftar di sistem</div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-primary">Tambah Peserta</button>
                </div>
            </form>
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
            const regNumber = row.cells[3]?.textContent.toLowerCase() || '';
            
            if (name.includes(searchValue) || email.includes(searchValue) || regNumber.includes(searchValue)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });

    // Export functionality
    function exportEventParticipants(eventId) {
        window.location.href = `/admin/events/${eventId}/export`;
    }

    // Participant actions
    function viewParticipant(participantId) {
        // Implement view participant details
        alert('View participant ' + participantId);
    }

    function markAttendance(participantId) {
        // Implement mark attendance
        if (confirm('Tandai peserta ini sebagai hadir?')) {
            fetch(`/admin/events/{{ $event->id }}/participants/${participantId}/attendance`, {
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

    function generateCertificate(participantId) {
        // Implement generate certificate
        if (confirm('Generate sertifikat untuk peserta ini?')) {
            fetch(`/admin/events/{{ $event->id }}/participants/${participantId}/certificate`, {
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

    function removeParticipant(participantId) {
        // Implement remove participant
        if (confirm('Apakah Anda yakin ingin menghapus peserta ini?')) {
            fetch(`/admin/events/{{ $event->id }}/participants/${participantId}`, {
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