@extends('admin.layouts.app')

@section('title', 'Create New Event')

@section('content')
<div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="h3 mb-0">Create New Event</h1>
        <a href="{{ route('admin.events.index') }}" class="btn btn-outline-secondary">
            <i class="fas fa-arrow-left me-1"></i> Back to Events
        </a>
    </div>

    <div class="card shadow-sm">
        <div class="card-body">
            <form action="{{ route('admin.events.store') }}" method="POST" enctype="multipart/form-data">
                @csrf
                
                <div class="row">
                    <div class="col-md-8">
                        <div class="mb-3">
                            <label for="title" class="form-label">Event Title <span class="text-danger">*</span></label>
                            <input type="text" class="form-control @error('title') is-invalid @enderror" 
                                   id="title" name="title" value="{{ old('title') }}" required>
                            @error('title')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="mb-3">
                            <label for="description" class="form-label">Description <span class="text-danger">*</span></label>
                            <textarea class="form-control @error('description') is-invalid @enderror" 
                                      id="description" name="description" rows="4" required>{{ old('description') }}</textarea>
                            @error('description')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="date" class="form-label">Event Date <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control datepicker @error('date') is-invalid @enderror" 
                                           id="date" name="date" value="{{ old('date') }}" required>
                                    @error('date')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="mb-3">
                                    <label for="start_time" class="form-label">Start Time <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control timepicker @error('start_time') is-invalid @enderror" 
                                           id="start_time" name="start_time" value="{{ old('start_time') }}" required>
                                    @error('start_time')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="mb-3">
                                    <label for="end_time" class="form-label">End Time <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control timepicker @error('end_time') is-invalid @enderror" 
                                           id="end_time" name="end_time" value="{{ old('end_time') }}" required>
                                    @error('end_time')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-8">
                                <div class="mb-3">
                                    <label for="location" class="form-label">Location <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control @error('location') is-invalid @enderror" 
                                           id="location" name="location" value="{{ old('location') }}" required>
                                    @error('location')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label for="max_participants" class="form-label">Max Participants</label>
                                    <input type="number" class="form-control @error('max_participants') is-invalid @enderror" 
                                           id="max_participants" name="max_participants" value="{{ old('max_participants') }}" 
                                           min="1">
                                    @error('max_participants')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                    <div class="form-text">Leave empty for unlimited participants</div>
                                </div>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="registration_deadline" class="form-label">Registration Deadline <span class="text-danger">*</span></label>
                            <input type="text" class="form-control datepicker @error('registration_deadline') is-invalid @enderror" 
                                   id="registration_deadline" name="registration_deadline" value="{{ old('registration_deadline') }}" required>
                            @error('registration_deadline')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                            <div class="form-text">Last date to register for this event</div>
                        </div>
                    </div>

                    <div class="col-md-4">
                        <div class="card mb-3">
                            <div class="card-header">
                                <h6 class="mb-0">Event Flyer</h6>
                            </div>
                            <div class="card-body text-center">
                                <div class="mb-3" id="flyerPreview" style="display: none;">
                                    <img src="#" alt="Flyer Preview" class="img-fluid rounded" id="flyerPreviewImg">
                                </div>
                                <div class="d-grid">
                                    <input type="file" class="form-control @error('flyer') is-invalid @enderror" 
                                           id="flyer" name="flyer" accept="image/*" onchange="previewImage(this, 'flyerPreview')">
                                    @error('flyer')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                    <div class="form-text">Recommended size: 800x600px, Max: 2MB</div>
                                </div>
                            </div>
                        </div>

                        <div class="card">
                            <div class="card-header">
                                <h6 class="mb-0">Certificate Template (Optional)</h6>
                            </div>
                            <div class="card-body text-center">
                                <div class="mb-3">
                                    <div class="text-muted small mb-2">Upload a custom certificate template</div>
                                    <input type="file" class="form-control @error('certificate_template') is-invalid @enderror" 
                                           id="certificate_template" name="certificate_template" accept=".pdf,.jpg,.jpeg,.png">
                                    @error('certificate_template')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                    <div class="form-text">PDF, JPG, or PNG. Max: 5MB</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="d-flex justify-content-end mt-4">
                    <button type="reset" class="btn btn-outline-secondary me-2">Reset</button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save me-1"></i> Create Event
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    // Image preview function
    function previewImage(input, previewId) {
        const preview = document.getElementById(previewId);
        const previewImg = document.getElementById(previewId + 'Img');
        
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                preview.style.display = 'block';
                previewImg.src = e.target.result;
            }
            
            reader.readAsDataURL(input.files[0]);
        } else {
            preview.style.display = 'none';
            previewImg.src = '#';
        }
    }

    // Initialize date picker with min date today
    flatpickr('.datepicker', {
        minDate: 'today',
        dateFormat: 'Y-m-d',
        allowInput: true
    });

    // Initialize time picker
    flatpickr('.timepicker', {
        enableTime: true,
        noCalendar: true,
        dateFormat: 'H:i',
        time_24hr: true
    });
</script>
@endpush
