@extends('admin.layouts.app')

@section('title', 'Edit Event: ' . $event->title)

@section('content')
<div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="h3 mb-0">Edit Event: {{ $event->title }}</h1>
        <div>
            <a href="{{ route('admin.events.show', $event) }}" class="btn btn-outline-secondary me-2">
                <i class="fas fa-eye me-1"></i> View
            </a>
            <a href="{{ route('admin.events.index') }}" class="btn btn-outline-secondary">
                <i class="fas fa-arrow-left me-1"></i> Back to Events
            </a>
        </div>
    </div>

    <div class="card shadow-sm">
        <div class="card-body">
            <form action="{{ route('admin.events.update', $event) }}" method="POST" enctype="multipart/form-data">
                @csrf
                @method('PUT')
                
                <div class="row">
                    <div class="col-md-8">
                        <div class="mb-3">
                            <label for="title" class="form-label">Event Title <span class="text-danger">*</span></label>
                            <input type="text" class="form-control @error('title') is-invalid @enderror" 
                                   id="title" name="title" value="{{ old('title', $event->title) }}" required>
                            @error('title')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="mb-3">
                            <label for="description" class="form-label">Description <span class="text-danger">*</span></label>
                            <textarea class="form-control @error('description') is-invalid @enderror" 
                                      id="description" name="description" rows="4" required>{{ old('description', $event->description) }}</textarea>
                            @error('description')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="date" class="form-label">Event Date <span class="text-danger">*</span></label>
                                    <input type="date" class="form-control @error('date') is-invalid @enderror" 
                                           id="date" name="date" value="{{ old('date', $event->date->format('Y-m-d')) }}" required>
                                    @error('date')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="mb-3">
                                    <label for="start_time" class="form-label">Start Time <span class="text-danger">*</span></label>
                                    <input type="time" class="form-control @error('start_time') is-invalid @enderror" 
                                           id="start_time" name="start_time" 
                                           value="{{ old('start_time', $event->start_time->format('H:i')) }}" required>
                                    @error('start_time')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="mb-3">
                                    <label for="end_time" class="form-label">End Time <span class="text-danger">*</span></label>
                                    <input type="time" class="form-control @error('end_time') is-invalid @enderror" 
                                           id="end_time" name="end_time" 
                                           value="{{ old('end_time', $event->end_time->format('H:i')) }}" required>
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
                                           id="location" name="location" value="{{ old('location', $event->location) }}" required>
                                    @error('location')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label for="max_participants" class="form-label">Max Participants</label>
                                    <input type="number" class="form-control @error('max_participants') is-invalid @enderror" 
                                           id="max_participants" name="max_participants" 
                                           value="{{ old('max_participants', $event->max_participants) }}" min="1">
                                    @error('max_participants')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                    <div class="form-text">Leave empty for unlimited participants</div>
                                </div>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="registration_deadline" class="form-label">Registration Deadline <span class="text-danger">*</span></label>
                            <input type="date" class="form-control @error('registration_deadline') is-invalid @enderror" 
                                   id="registration_deadline" name="registration_deadline" 
                                   value="{{ old('registration_deadline', $event->registration_deadline->format('Y-m-d')) }}" required>
                            @error('registration_deadline')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="form-check form-switch mb-3">
                            <input class="form-check-input" type="checkbox" id="is_active" name="is_active" 
                                   value="1" {{ old('is_active', $event->is_active) ? 'checked' : '' }}>
                            <label class="form-check-label" for="is_active">Active Event</label>
                            <div class="form-text">Inactive events won't be visible to participants</div>
                        </div>
                    </div>

                    <div class="col-md-4">
                        <div class="card mb-3">
                            <div class="card-header">
                                <h6 class="mb-0">Event Flyer</h6>
                            </div>
                            <div class="card-body text-center">
                                @if($event->flyer_path)
                                    <div class="mb-3" id="flyerPreview">
                                        <img src="{{ Storage::url($event->flyer_path) }}" alt="Current Flyer" class="img-fluid rounded mb-2">
                                        <div class="form-text">Current flyer</div>
                                    </div>
                                @else
                                    <div class="mb-3" id="flyerPreview" style="display: none;">
                                        <img src="#" alt="Flyer Preview" class="img-fluid rounded" id="flyerPreviewImg">
                                    </div>
                                @endif
                                
                                <div class="d-grid">
                                    <input type="file" class="form-control @error('flyer') is-invalid @enderror" 
                                           id="flyer" name="flyer" accept="image/*" onchange="previewImage(this, 'flyerPreview')">
                                    @error('flyer')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                    <div class="form-text">Leave empty to keep current. Recommended: 800x600px, Max: 2MB</div>
                                </div>
                            </div>
                        </div>

                        <div class="card">
                            <div class="card-header">
                                <h6 class="mb-0">Certificate Template</h6>
                            </div>
                            <div class="card-body text-center">
                                @if($event->certificate_template_path)
                                    <div class="mb-3">
                                        <div class="text-success mb-2">
                                            <i class="fas fa-file-pdf fa-3x"></i>
                                            <div>Template Uploaded</div>
                                        </div>
                                        <a href="{{ Storage::url($event->certificate_template_path) }}" 
                                           target="_blank" class="btn btn-sm btn-outline-primary">
                                            <i class="fas fa-eye me-1"></i> View Template
                                        </a>
                                    </div>
                                    <div class="form-check form-switch mb-3">
                                        <input class="form-check-input" type="checkbox" id="remove_template" name="remove_template" value="1">
                                        <label class="form-check-label" for="remove_template">Remove current template</label>
                                    </div>
                                @endif
                                
                                <div class="mb-3">
                                    <div class="text-muted small mb-2">Upload a new certificate template</div>
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
                        <i class="fas fa-save me-1"></i> Update Event
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
                if (previewImg) {
                    previewImg.src = e.target.result;
                } else {
                    // Create image element if it doesn't exist
                    const img = document.createElement('img');
                    img.id = previewId + 'Img';
                    img.src = e.target.result;
                    img.className = 'img-fluid rounded';
                    preview.innerHTML = '';
                    preview.appendChild(img);
                    
                    if (previewId === 'flyerPreview') {
                        const removeBtn = document.createElement('button');
                        removeBtn.type = 'button';
                        removeBtn.className = 'btn btn-sm btn-danger mt-2';
                        removeBtn.innerHTML = '<i class="fas fa-times me-1"></i> Remove';
                        removeBtn.onclick = function() {
                            input.value = '';
                            preview.style.display = 'none';
                            // Add a hidden input to indicate the flyer should be removed
                            const removeInput = document.createElement('input');
                            removeInput.type = 'hidden';
                            removeInput.name = 'remove_flyer';
                            removeInput.value = '1';
                            document.querySelector('form').appendChild(removeInput);
                        };
                        preview.appendChild(removeBtn);
                    }
                }
                preview.style.display = 'block';
            }
            
            reader.readAsDataURL(input.files[0]);
        } else if (previewImg) {
            preview.style.display = 'none';
            previewImg.src = '#';
        }
    }

    // Set minimum date for date inputs
    document.addEventListener('DOMContentLoaded', function() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').setAttribute('min', today);
        document.getElementById('registration_deadline').setAttribute('max', document.getElementById('date').value);
        
        // Update registration deadline max when event date changes
        document.getElementById('date').addEventListener('change', function() {
            document.getElementById('registration_deadline').setAttribute('max', this.value);
        });
    });
</script>
@endpush
