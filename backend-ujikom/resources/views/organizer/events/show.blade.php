@extends('layouts.app')

@section('title', 'Detail Event')

@section('content')
<div class="container-fluid">
    <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800">Detail Event</h1>
        <div>
            <a href="{{ route('organizer.events.edit', $event->id) }}" class="btn btn-primary btn-sm">
                <i class="fas fa-edit"></i> Edit Event
            </a>
            <a href="{{ route('organizer.dashboard') }}" class="btn btn-secondary btn-sm">
                <i class="fas fa-arrow-left"></i> Kembali
            </a>
        </div>
    </div>

    <!-- Event Info Card -->
    <div class="row">
        <div class="col-lg-8">
            <div class="card shadow mb-4">
                <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                    <h6 class="m-0 font-weight-bold text-primary">Informasi Event</h6>
                    <div class="dropdown no-arrow">
                        <a class="dropdown-toggle" href="#" role="button" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i class="fas fa-ellipsis-v fa-sm fa-fw text-gray-400"></i>
                        </a>
                        <div class="dropdown-menu dropdown-menu-right shadow animated--fade-in" aria-labelledby="dropdownMenuLink">
                            <a class="dropdown-item" href="{{ route('organizer.events.participants', $event->id) }}">
                                <i class="fas fa-users fa-sm fa-fw mr-2 text-gray-400"></i>
                                Kelola Peserta
                            </a>
                            <div class="dropdown-divider"></div>
                            <form action="{{ route('organizer.events.destroy', $event->id) }}" method="POST" class="d-inline">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="dropdown-item text-danger" onclick="return confirm('Apakah Anda yakin ingin menghapus event ini?')">
                                    <i class="fas fa-trash fa-sm fa-fw mr-2 text-danger"></i>
                                    Hapus Event
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    @if($event->banner)
                        <div class="text-center mb-4">
                            <img src="{{ asset('storage/' . $event->banner) }}" alt="{{ $event->title }}" class="img-fluid rounded" style="max-height: 300px;">
                        </div>
                    @endif

                    <h2 class="h4 font-weight-bold">{{ $event->title }}</h2>
                    
                    <div class="row mt-4">
                        <div class="col-md-6">
                            <p>
                                <i class="fas fa-calendar-day fa-fw text-gray-500 mr-2"></i>
                                <strong>Tanggal:</strong> {{ \Carbon\Carbon::parse($event->date)->format('d M Y') }}
                            </p>
                            <p>
                                <i class="fas fa-clock fa-fw text-gray-500 mr-2"></i>
                                <strong>Waktu:</strong> 
                                {{ \Carbon\Carbon::parse($event->start_time)->format('H:i') }} - 
                                {{ \Carbon\Carbon::parse($event->end_time)->format('H:i') }}
                            </p>
                            <p>
                                <i class="fas fa-map-marker-alt fa-fw text-gray-500 mr-2"></i>
                                <strong>Lokasi:</strong> {{ $event->location }}
                            </p>
                        </div>
                        <div class="col-md-6">
                            <p>
                                <i class="fas fa-users fa-fw text-gray-500 mr-2"></i>
                                <strong>Peserta:</strong> 
                                {{ $event->participants->count() }}
                                @if($event->max_participants)
                                    / {{ $event->max_participants }}
                                @endif
                            </p>
                            <p>
                                <i class="fas fa-money-bill fa-fw text-gray-500 mr-2"></i>
                                <strong>Biaya Pendaftaran:</strong> 
                                @if($event->registration_fee > 0)
                                    Rp {{ number_format($event->registration_fee, 0, ',', '.') }}
                                @else
                                    Gratis
                                @endif
                            </p>
                            <p>
                                <i class="fas fa-info-circle fa-fw text-gray-500 mr-2"></i>
                                <strong>Status:</strong> 
                                @if($event->status == 'published')
                                    <span class="badge badge-success">Dipublikasikan</span>
                                @else
                                    <span class="badge badge-secondary">Draft</span>
                                @endif
                            </p>
                        </div>
                    </div>

                    <hr>

                    <div class="mt-4">
                        <h5>Deskripsi Event</h5>
                        <p class="text-justify">{{ $event->description }}</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-lg-4">
            <!-- Participants Card -->
            <div class="card shadow mb-4">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">Peserta</h6>
                </div>
                <div class="card-body">
                    <div class="text-center mb-3">
                        <h1 class="h2 mb-0 font-weight-bold text-gray-800">{{ $event->participants->count() }}</h1>
                        <p class="text-muted">Total Peserta</p>
                    </div>

                    <div class="progress mb-4">
                        @php
                            $percentage = $event->max_participants 
                                ? min(100, round(($event->participants->count() / $event->max_participants) * 100)) 
                                : 100;
                        @endphp
                        <div class="progress-bar" role="progressbar" style="width: {{ $percentage }}%;" 
                            aria-valuenow="{{ $percentage }}" aria-valuemin="0" aria-valuemax="100">
                            {{ $percentage }}%
                        </div>
                    </div>

                    <div class="text-center mt-4">
                        <a href="{{ route('organizer.events.participants', $event->id) }}" class="btn btn-primary btn-sm">
                            <i class="fas fa-users fa-sm"></i> Kelola Peserta
                        </a>
                    </div>
                </div>
            </div>

            <!-- Documents Card -->
            <div class="card shadow mb-4">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">Dokumen</h6>
                </div>
                <div class="card-body">
                    @if($event->documents && count(json_decode($event->documents)) > 0)
                        <ul class="list-group">
                            @foreach(json_decode($event->documents) as $document)
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    <span>{{ basename($document) }}</span>
                                    <a href="{{ asset('storage/' . $document) }}" target="_blank" class="btn btn-sm btn-info">
                                        <i class="fas fa-download"></i>
                                    </a>
                                </li>
                            @endforeach
                        </ul>
                    @else
                        <p class="text-center text-muted">Belum ada dokumen</p>
                    @endif

                    <div class="text-center mt-3">
                        <button type="button" class="btn btn-primary btn-sm" data-toggle="modal" data-target="#uploadDocumentModal">
                            <i class="fas fa-upload fa-sm"></i> Upload Dokumen
                        </button>
                    </div>
                </div>
            </div>

            <!-- Internal Notes Card -->
            <div class="card shadow mb-4">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">Catatan Internal</h6>
                </div>
                <div class="card-body">
                    <form action="{{ route('organizer.events.update.notes', $event->id) }}" method="POST">
                        @csrf
                        @method('PUT')
                        <div class="form-group">
                            <textarea class="form-control" name="internal_notes" rows="4">{{ $event->internal_notes }}</textarea>
                        </div>
                        <button type="submit" class="btn btn-primary btn-sm btn-block">
                            <i class="fas fa-save fa-sm"></i> Simpan Catatan
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Upload Document Modal -->
<div class="modal fade" id="uploadDocumentModal" tabindex="-1" role="dialog" aria-labelledby="uploadDocumentModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="uploadDocumentModalLabel">Upload Dokumen</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <form action="{{ route('organizer.events.upload.documents', $event->id) }}" method="POST" enctype="multipart/form-data">
                @csrf
                <div class="modal-body">
                    <div class="form-group">
                        <label for="documents">Pilih Dokumen</label>
                        <input type="file" class="form-control-file" id="documents" name="documents[]" multiple required>
                        <small class="form-text text-muted">Format: PDF, DOC, DOCX, XLS, XLSX. Ukuran maksimal: 5MB per file</small>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-primary">Upload</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection