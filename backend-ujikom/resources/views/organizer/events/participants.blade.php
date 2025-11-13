@extends('layouts.app')

@section('title', 'Kelola Peserta Event')

@section('content')
<div class="container-fluid">
    <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800">Kelola Peserta: {{ $event->title }}</h1>
        <div>
            <a href="{{ route('organizer.events.show', $event->id) }}" class="btn btn-secondary btn-sm">
                <i class="fas fa-arrow-left"></i> Kembali ke Detail Event
            </a>
        </div>
    </div>

    <!-- Participants Card -->
    <div class="card shadow mb-4">
        <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
            <h6 class="m-0 font-weight-bold text-primary">Daftar Peserta</h6>
            <div>
                <button type="button" class="btn btn-sm btn-success" data-toggle="modal" data-target="#emailParticipantsModal">
                    <i class="fas fa-envelope"></i> Email Semua Peserta
                </button>
                <a href="{{ route('organizer.events.participants.export', $event->id) }}" class="btn btn-sm btn-info">
                    <i class="fas fa-file-excel"></i> Export Data
                </a>
            </div>
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-bordered" id="participantsTable" width="100%" cellspacing="0">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama</th>
                            <th>Email</th>
                            <th>No. Telepon</th>
                            <th>Status</th>
                            <th>Tanggal Daftar</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($participants as $index => $participant)
                        <tr>
                            <td>{{ $index + 1 }}</td>
                            <td>{{ $participant->user->name }}</td>
                            <td>{{ $participant->user->email }}</td>
                            <td>{{ $participant->user->phone ?? '-' }}</td>
                            <td>
                                @if($participant->status == 'pending')
                                    <span class="badge badge-warning">Menunggu Konfirmasi</span>
                                @elseif($participant->status == 'confirmed')
                                    <span class="badge badge-success">Terkonfirmasi</span>
                                @elseif($participant->status == 'cancelled')
                                    <span class="badge badge-danger">Dibatalkan</span>
                                @elseif($participant->status == 'attended')
                                    <span class="badge badge-primary">Hadir</span>
                                @endif
                            </td>
                            <td>{{ $participant->created_at->format('d M Y H:i') }}</td>
                            <td>
                                <div class="btn-group" role="group">
                                    <button type="button" class="btn btn-sm btn-info" data-toggle="modal" data-target="#viewParticipantModal{{ $participant->id }}">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button type="button" class="btn btn-sm btn-primary" data-toggle="modal" data-target="#updateStatusModal{{ $participant->id }}">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button type="button" class="btn btn-sm btn-success" data-toggle="modal" data-target="#emailParticipantModal{{ $participant->id }}">
                                        <i class="fas fa-envelope"></i>
                                    </button>
                                </div>

                                <!-- View Participant Modal -->
                                <div class="modal fade" id="viewParticipantModal{{ $participant->id }}" tabindex="-1" role="dialog" aria-labelledby="viewParticipantModalLabel{{ $participant->id }}" aria-hidden="true">
                                    <div class="modal-dialog" role="document">
                                        <div class="modal-content">
                                            <div class="modal-header">
                                                <h5 class="modal-title" id="viewParticipantModalLabel{{ $participant->id }}">Detail Peserta</h5>
                                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                    <span aria-hidden="true">&times;</span>
                                                </button>
                                            </div>
                                            <div class="modal-body">
                                                <div class="text-center mb-3">
                                                    @if($participant->user->avatar)
                                                        <img src="{{ asset('storage/' . $participant->user->avatar) }}" alt="{{ $participant->user->name }}" class="img-profile rounded-circle" style="width: 100px; height: 100px;">
                                                    @else
                                                        <div class="img-profile rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style="width: 100px; height: 100px; font-size: 2rem; margin: 0 auto;">
                                                            {{ substr($participant->user->name, 0, 1) }}
                                                        </div>
                                                    @endif
                                                </div>

                                                <h5 class="text-center mb-3">{{ $participant->user->name }}</h5>

                                                <ul class="list-group list-group-flush">
                                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                                        <span><i class="fas fa-envelope fa-fw text-gray-500 mr-2"></i> Email:</span>
                                                        <span>{{ $participant->user->email }}</span>
                                                    </li>
                                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                                        <span><i class="fas fa-phone fa-fw text-gray-500 mr-2"></i> No. Telepon:</span>
                                                        <span>{{ $participant->user->phone ?? '-' }}</span>
                                                    </li>
                                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                                        <span><i class="fas fa-calendar-check fa-fw text-gray-500 mr-2"></i> Status:</span>
                                                        @if($participant->status == 'pending')
                                                            <span class="badge badge-warning">Menunggu Konfirmasi</span>
                                                        @elseif($participant->status == 'confirmed')
                                                            <span class="badge badge-success">Terkonfirmasi</span>
                                                        @elseif($participant->status == 'cancelled')
                                                            <span class="badge badge-danger">Dibatalkan</span>
                                                        @elseif($participant->status == 'attended')
                                                            <span class="badge badge-primary">Hadir</span>
                                                        @endif
                                                    </li>
                                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                                        <span><i class="fas fa-clock fa-fw text-gray-500 mr-2"></i> Tanggal Daftar:</span>
                                                        <span>{{ $participant->created_at->format('d M Y H:i') }}</span>
                                                    </li>
                                                    @if($participant->payment_status)
                                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                                        <span><i class="fas fa-money-bill fa-fw text-gray-500 mr-2"></i> Status Pembayaran:</span>
                                                        @if($participant->payment_status == 'paid')
                                                            <span class="badge badge-success">Lunas</span>
                                                        @elseif($participant->payment_status == 'pending')
                                                            <span class="badge badge-warning">Menunggu Pembayaran</span>
                                                        @else
                                                            <span class="badge badge-danger">Belum Bayar</span>
                                                        @endif
                                                    </li>
                                                    @endif
                                                </ul>
                                            </div>
                                            <div class="modal-footer">
                                                <button type="button" class="btn btn-secondary" data-dismiss="modal">Tutup</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Update Status Modal -->
                                <div class="modal fade" id="updateStatusModal{{ $participant->id }}" tabindex="-1" role="dialog" aria-labelledby="updateStatusModalLabel{{ $participant->id }}" aria-hidden="true">
                                    <div class="modal-dialog" role="document">
                                        <div class="modal-content">
                                            <div class="modal-header">
                                                <h5 class="modal-title" id="updateStatusModalLabel{{ $participant->id }}">Update Status Peserta</h5>
                                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                    <span aria-hidden="true">&times;</span>
                                                </button>
                                            </div>
                                            <form action="{{ route('organizer.events.participants.update', [$event->id, $participant->id]) }}" method="POST">
                                                @csrf
                                                @method('PUT')
                                                <div class="modal-body">
                                                    <div class="form-group">
                                                        <label for="status{{ $participant->id }}">Status Peserta</label>
                                                        <select class="form-control" id="status{{ $participant->id }}" name="status">
                                                            <option value="pending" {{ $participant->status == 'pending' ? 'selected' : '' }}>Menunggu Konfirmasi</option>
                                                            <option value="confirmed" {{ $participant->status == 'confirmed' ? 'selected' : '' }}>Terkonfirmasi</option>
                                                            <option value="cancelled" {{ $participant->status == 'cancelled' ? 'selected' : '' }}>Dibatalkan</option>
                                                            <option value="attended" {{ $participant->status == 'attended' ? 'selected' : '' }}>Hadir</option>
                                                        </select>
                                                    </div>
                                                    @if($event->registration_fee > 0)
                                                    <div class="form-group">
                                                        <label for="payment_status{{ $participant->id }}">Status Pembayaran</label>
                                                        <select class="form-control" id="payment_status{{ $participant->id }}" name="payment_status">
                                                            <option value="unpaid" {{ $participant->payment_status == 'unpaid' ? 'selected' : '' }}>Belum Bayar</option>
                                                            <option value="pending" {{ $participant->payment_status == 'pending' ? 'selected' : '' }}>Menunggu Pembayaran</option>
                                                            <option value="paid" {{ $participant->payment_status == 'paid' ? 'selected' : '' }}>Lunas</option>
                                                        </select>
                                                    </div>
                                                    @endif
                                                    <div class="form-group">
                                                        <label for="notes{{ $participant->id }}">Catatan (opsional)</label>
                                                        <textarea class="form-control" id="notes{{ $participant->id }}" name="notes" rows="3">{{ $participant->notes }}</textarea>
                                                    </div>
                                                </div>
                                                <div class="modal-footer">
                                                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Batal</button>
                                                    <button type="submit" class="btn btn-primary">Simpan Perubahan</button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>

                                <!-- Email Participant Modal -->
                                <div class="modal fade" id="emailParticipantModal{{ $participant->id }}" tabindex="-1" role="dialog" aria-labelledby="emailParticipantModalLabel{{ $participant->id }}" aria-hidden="true">
                                    <div class="modal-dialog" role="document">
                                        <div class="modal-content">
                                            <div class="modal-header">
                                                <h5 class="modal-title" id="emailParticipantModalLabel{{ $participant->id }}">Kirim Email ke Peserta</h5>
                                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                    <span aria-hidden="true">&times;</span>
                                                </button>
                                            </div>
                                            <form action="{{ route('organizer.events.participants.email', [$event->id, $participant->id]) }}" method="POST">
                                                @csrf
                                                <div class="modal-body">
                                                    <div class="form-group">
                                                        <label for="subject{{ $participant->id }}">Subjek</label>
                                                        <input type="text" class="form-control" id="subject{{ $participant->id }}" name="subject" required>
                                                    </div>
                                                    <div class="form-group">
                                                        <label for="message{{ $participant->id }}">Pesan</label>
                                                        <textarea class="form-control" id="message{{ $participant->id }}" name="message" rows="5" required></textarea>
                                                    </div>
                                                </div>
                                                <div class="modal-footer">
                                                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Batal</button>
                                                    <button type="submit" class="btn btn-primary">Kirim Email</button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<!-- Email All Participants Modal -->
<div class="modal fade" id="emailParticipantsModal" tabindex="-1" role="dialog" aria-labelledby="emailParticipantsModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="emailParticipantsModalLabel">Kirim Email ke Semua Peserta</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <form action="{{ route('organizer.events.participants.email.all', $event->id) }}" method="POST">
                @csrf
                <div class="modal-body">
                    <div class="form-group">
                        <label for="subject">Subjek</label>
                        <input type="text" class="form-control" id="subject" name="subject" required>
                    </div>
                    <div class="form-group">
                        <label for="message">Pesan</label>
                        <textarea class="form-control" id="message" name="message" rows="5" required></textarea>
                        <small class="form-text text-muted">
                            Anda dapat menggunakan variabel berikut: {name}, {event_title}, {event_date}, {event_location}
                        </small>
                    </div>
                    <div class="form-group">
                        <label>Kirim ke:</label>
                        <div class="custom-control custom-checkbox">
                            <input type="checkbox" class="custom-control-input" id="sendToAll" name="send_to_all" value="1" checked>
                            <label class="custom-control-label" for="sendToAll">Semua peserta</label>
                        </div>
                        <div class="custom-control custom-checkbox">
                            <input type="checkbox" class="custom-control-input" id="sendToConfirmed" name="send_to_confirmed" value="1">
                            <label class="custom-control-label" for="sendToConfirmed">Hanya peserta terkonfirmasi</label>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-primary">Kirim Email</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
    $(document).ready(function() {
        $('#participantsTable').DataTable();
        
        // Toggle checkbox logic
        $('#sendToAll').change(function() {
            if($(this).is(':checked')) {
                $('#sendToConfirmed').prop('checked', false);
            }
        });
        
        $('#sendToConfirmed').change(function() {
            if($(this).is(':checked')) {
                $('#sendToAll').prop('checked', false);
            }
        });
    });
</script>
@endsection