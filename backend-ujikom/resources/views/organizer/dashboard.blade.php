@extends('layouts.app')

@section('title', 'Dashboard Event Organizer')

@section('content')
<div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="h3 mb-0 text-gray-800">Dashboard Event Organizer</h1>
        <div>
            <a href="{{ route('organizer.events.create') }}" class="btn btn-primary">
                <i class="fas fa-plus"></i> Buat Event Baru
            </a>
        </div>
    </div>

    <!-- Event Stats Cards -->
    <div class="row">
        <div class="col-xl-3 col-md-6 mb-4">
            <div class="card border-left-primary shadow h-100 py-2">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                Total Event</div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">
                                {{ $upcomingEvents->count() + $ongoingEvents->count() + $completedEvents->count() }}
                            </div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-calendar fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-4">
            <div class="card border-left-success shadow h-100 py-2">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                                Event Mendatang</div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">{{ $upcomingEvents->count() }}</div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-calendar-plus fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-4">
            <div class="card border-left-info shadow h-100 py-2">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-info text-uppercase mb-1">
                                Event Berlangsung</div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">{{ $ongoingEvents->count() }}</div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-calendar-day fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-4">
            <div class="card border-left-warning shadow h-100 py-2">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                Total Peserta</div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">{{ $totalParticipants }}</div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-users fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Upcoming Events -->
    <div class="card shadow mb-4">
        <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
            <h6 class="m-0 font-weight-bold text-primary">Event Mendatang</h6>
        </div>
        <div class="card-body">
            @if($upcomingEvents->count() > 0)
                <div class="table-responsive">
                    <table class="table table-bordered" width="100%" cellspacing="0">
                        <thead>
                            <tr>
                                <th>Judul</th>
                                <th>Tanggal</th>
                                <th>Lokasi</th>
                                <th>Peserta</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($upcomingEvents as $event)
                                <tr>
                                    <td>{{ $event->title }}</td>
                                    <td>{{ \Carbon\Carbon::parse($event->date)->format('d M Y') }}</td>
                                    <td>{{ $event->location }}</td>
                                    <td>
                                        {{ $event->participants->count() }} 
                                        @if($event->max_participants)
                                            / {{ $event->max_participants }}
                                        @endif
                                    </td>
                                    <td>
                                        <div class="btn-group" role="group">
                                            <a href="{{ route('organizer.events.show', $event->id) }}" class="btn btn-sm btn-info">
                                                <i class="fas fa-eye"></i>
                                            </a>
                                            <a href="{{ route('organizer.events.edit', $event->id) }}" class="btn btn-sm btn-primary">
                                                <i class="fas fa-edit"></i>
                                            </a>
                                            <a href="{{ route('organizer.events.participants', $event->id) }}" class="btn btn-sm btn-success">
                                                <i class="fas fa-users"></i>
                                            </a>
                                            <form action="{{ route('organizer.events.destroy', $event->id) }}" method="POST" class="d-inline">
                                                @csrf
                                                @method('DELETE')
                                                <button type="submit" class="btn btn-sm btn-danger" onclick="return confirm('Apakah Anda yakin ingin menghapus event ini?')">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            @else
                <div class="text-center py-4">
                    <p class="text-muted">Tidak ada event mendatang</p>
                    <a href="{{ route('organizer.events.create') }}" class="btn btn-primary">
                        <i class="fas fa-plus"></i> Buat Event Baru
                    </a>
                </div>
            @endif
        </div>
    </div>

    <!-- Ongoing Events -->
    <div class="card shadow mb-4">
        <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
            <h6 class="m-0 font-weight-bold text-info">Event Berlangsung</h6>
        </div>
        <div class="card-body">
            @if($ongoingEvents->count() > 0)
                <div class="table-responsive">
                    <table class="table table-bordered" width="100%" cellspacing="0">
                        <thead>
                            <tr>
                                <th>Judul</th>
                                <th>Waktu</th>
                                <th>Lokasi</th>
                                <th>Peserta</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($ongoingEvents as $event)
                                <tr>
                                    <td>{{ $event->title }}</td>
                                    <td>
                                        {{ \Carbon\Carbon::parse($event->start_time)->format('H:i') }} - 
                                        {{ \Carbon\Carbon::parse($event->end_time)->format('H:i') }}
                                    </td>
                                    <td>{{ $event->location }}</td>
                                    <td>
                                        {{ $event->participants->count() }} 
                                        @if($event->max_participants)
                                            / {{ $event->max_participants }}
                                        @endif
                                    </td>
                                    <td>
                                        <div class="btn-group" role="group">
                                            <a href="{{ route('organizer.events.show', $event->id) }}" class="btn btn-sm btn-info">
                                                <i class="fas fa-eye"></i>
                                            </a>
                                            <a href="{{ route('organizer.events.participants', $event->id) }}" class="btn btn-sm btn-success">
                                                <i class="fas fa-users"></i>
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            @else
                <div class="text-center py-4">
                    <p class="text-muted">Tidak ada event yang sedang berlangsung hari ini</p>
                </div>
            @endif
        </div>
    </div>

    <!-- Completed Events -->
    <div class="card shadow mb-4">
        <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
            <h6 class="m-0 font-weight-bold text-secondary">Event Selesai</h6>
        </div>
        <div class="card-body">
            @if($completedEvents->count() > 0)
                <div class="table-responsive">
                    <table class="table table-bordered" width="100%" cellspacing="0">
                        <thead>
                            <tr>
                                <th>Judul</th>
                                <th>Tanggal</th>
                                <th>Lokasi</th>
                                <th>Peserta</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($completedEvents as $event)
                                <tr>
                                    <td>{{ $event->title }}</td>
                                    <td>{{ \Carbon\Carbon::parse($event->date)->format('d M Y') }}</td>
                                    <td>{{ $event->location }}</td>
                                    <td>
                                        {{ $event->participants->count() }} 
                                        @if($event->max_participants)
                                            / {{ $event->max_participants }}
                                        @endif
                                    </td>
                                    <td>
                                        <div class="btn-group" role="group">
                                            <a href="{{ route('organizer.events.show', $event->id) }}" class="btn btn-sm btn-info">
                                                <i class="fas fa-eye"></i>
                                            </a>
                                            <a href="{{ route('organizer.events.participants', $event->id) }}" class="btn btn-sm btn-success">
                                                <i class="fas fa-users"></i>
                                            </a>
                                            <button type="button" class="btn btn-sm btn-secondary" data-toggle="modal" data-target="#reportModal{{ $event->id }}">
                                                <i class="fas fa-file-alt"></i>
                                            </button>
                                        </div>

                                        <!-- Report Modal -->
                                        <div class="modal fade" id="reportModal{{ $event->id }}" tabindex="-1" role="dialog" aria-labelledby="reportModalLabel" aria-hidden="true">
                                            <div class="modal-dialog" role="document">
                                                <div class="modal-content">
                                                    <div class="modal-header">
                                                        <h5 class="modal-title" id="reportModalLabel">Kirim Laporan Event</h5>
                                                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                            <span aria-hidden="true">&times;</span>
                                                        </button>
                                                    </div>
                                                    <form action="{{ route('organizer.events.report.send', $event->id) }}" method="POST" enctype="multipart/form-data">
                                                        @csrf
                                                        <div class="modal-body">
                                                            <div class="form-group">
                                                                <label for="report_content">Isi Laporan</label>
                                                                <textarea class="form-control" id="report_content" name="report_content" rows="5" required></textarea>
                                                            </div>
                                                            <div class="form-group">
                                                                <label for="attachments">Lampiran (opsional)</label>
                                                                <input type="file" class="form-control-file" id="attachments" name="attachments[]" multiple>
                                                                <small class="form-text text-muted">Ukuran maksimal file: 5MB</small>
                                                            </div>
                                                        </div>
                                                        <div class="modal-footer">
                                                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Batal</button>
                                                            <button type="submit" class="btn btn-primary">Kirim Laporan</button>
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
            @else
                <div class="text-center py-4">
                    <p class="text-muted">Tidak ada event yang telah selesai</p>
                </div>
            @endif
        </div>
    </div>
</div>
@endsection