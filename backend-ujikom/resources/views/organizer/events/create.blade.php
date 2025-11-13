@extends('layouts.app')

@section('title', 'Buat Event Baru')

@section('content')
<div class="container-fluid">
    <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800">Buat Event Baru</h1>
        <a href="{{ route('organizer.dashboard') }}" class="btn btn-sm btn-secondary">
            <i class="fas fa-arrow-left"></i> Kembali ke Dashboard
        </a>
    </div>

    <div class="card shadow mb-4">
        <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">Form Event Baru</h6>
        </div>
        <div class="card-body">
            <form action="{{ route('organizer.events.store') }}" method="POST" enctype="multipart/form-data">
                @csrf
                
                @if ($errors->any())
                    <div class="alert alert-danger">
                        <ul class="mb-0">
                            @foreach ($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="title">Judul Event <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="title" name="title" value="{{ old('title') }}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="date">Tanggal <span class="text-danger">*</span></label>
                            <input type="date" class="form-control" id="date" name="date" value="{{ old('date') }}" required>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="start_time">Waktu Mulai <span class="text-danger">*</span></label>
                                    <input type="time" class="form-control" id="start_time" name="start_time" value="{{ old('start_time') }}" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="end_time">Waktu Selesai <span class="text-danger">*</span></label>
                                    <input type="time" class="form-control" id="end_time" name="end_time" value="{{ old('end_time') }}" required>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="location">Lokasi <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="location" name="location" value="{{ old('location') }}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="max_participants">Jumlah Maksimal Peserta</label>
                            <input type="number" class="form-control" id="max_participants" name="max_participants" value="{{ old('max_participants') }}" min="1">
                            <small class="form-text text-muted">Biarkan kosong jika tidak ada batasan</small>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="description">Deskripsi Event <span class="text-danger">*</span></label>
                            <textarea class="form-control" id="description" name="description" rows="5" required>{{ old('description') }}</textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="banner">Banner Event</label>
                            <input type="file" class="form-control-file" id="banner" name="banner" accept="image/*">
                            <small class="form-text text-muted">Format: JPG, PNG, GIF. Ukuran maksimal: 2MB</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="registration_fee">Biaya Pendaftaran (Rp)</label>
                            <input type="number" class="form-control" id="registration_fee" name="registration_fee" value="{{ old('registration_fee', 0) }}" min="0">
                            <small class="form-text text-muted">Masukkan 0 untuk event gratis</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="status">Status Event</label>
                            <select class="form-control" id="status" name="status">
                                <option value="draft" {{ old('status') == 'draft' ? 'selected' : '' }}>Draft</option>
                                <option value="published" {{ old('status') == 'published' ? 'selected' : '' }}>Publikasikan</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="internal_notes">Catatan Internal (hanya untuk panitia)</label>
                    <textarea class="form-control" id="internal_notes" name="internal_notes" rows="3">{{ old('internal_notes') }}</textarea>
                </div>
                
                <div class="form-group">
                    <label for="documents">Dokumen Pendukung (opsional)</label>
                    <input type="file" class="form-control-file" id="documents" name="documents[]" multiple>
                    <small class="form-text text-muted">Format: PDF, DOC, DOCX, XLS, XLSX. Ukuran maksimal: 5MB per file</small>
                </div>
                
                <hr>
                
                <div class="text-right">
                    <button type="reset" class="btn btn-secondary">Reset</button>
                    <button type="submit" class="btn btn-primary">Simpan Event</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
    // Validasi form
    document.addEventListener('DOMContentLoaded', function() {
        const form = document.querySelector('form');
        form.addEventListener('submit', function(event) {
            const startTime = document.getElementById('start_time').value;
            const endTime = document.getElementById('end_time').value;
            
            if (startTime >= endTime) {
                event.preventDefault();
                alert('Waktu selesai harus lebih besar dari waktu mulai!');
            }
        });
    });
</script>
@endsection