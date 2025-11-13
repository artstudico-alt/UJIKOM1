@extends('admin.layouts.app')

@section('title', $event->title)

@section('content')
<div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h1 class="h3 mb-0">{{ $event->title }}</h1>
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb mb-0">
                    <li class="breadcrumb-item"><a href="{{ route('admin.dashboard') }}">Dashboard</a></li>
                    <li class="breadcrumb-item"><a href="{{ route('admin.events.index') }}">Events</a></li>
                    <li class="breadcrumb-item active" aria-current="page">{{ $event->title }}</li>
                </ol>
            </nav>
        </div>
        <div>
            <a href="{{ route('admin.events.edit', $event) }}" class="btn btn-outline-primary me-2">
                <i class="fas fa-edit me-1"></i> Edit
            </a>
            <a href="{{ route('admin.events.index') }}" class="btn btn-outline-secondary">
                <i class="fas fa-arrow-left me-1"></i> Back to Events
            </a>
        </div>
    </div>

    <div class="row">
        <div class="col-lg-8">
            <div class="card shadow-sm mb-4">
                <div class="card-body">
                    @if($event->flyer_path)
                        <div class="text-center mb-4">
                            <img src="{{ Storage::url($event->flyer_path) }}" alt="{{ $event->title }}" class="img-fluid rounded" style="max-height: 400px;">
                        </div>
                    @endif
                    
                    <div class="mb-4">
                        <h4>Event Details</h4>
                        <div class="table-responsive">
                            <table class="table table-bordered">
                                <tbody>
                                    <tr>
                                        <th style="width: 30%;">Title</th>
                                        <td>{{ $event->title }}</td>
                                    </tr>
                                    <tr>
                                        <th>Date & Time</th>
                                        <td>
                                            {{ $event->date->format('l, F j, Y') }}<br>
                                            {{ $event->start_time->format('g:i A') }} - {{ $event->end_time->format('g:i A') }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Location</th>
                                        <td>{{ $event->location }}</td>
                                    </tr>
                                    <tr>
                                        <th>Registration Deadline</th>
                                        <td>
                                            {{ $event->registration_deadline->format('F j, Y') }}
                                            @if($event->registration_deadline->isPast())
                                                <span class="badge bg-danger ms-2">Closed</span>
                                            @else
                                                <span class="badge bg-success ms-2">Open</span>
                                            @endif
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Max Participants</th>
                                        <td>{{ $event->max_participants ?? 'Unlimited' }}</td>
                                    </tr>
                                    <tr>
                                        <th>Status</th>
                                        <td>
                                            @if($event->is_active)
                                                <span class="badge bg-success">Active</span>
                                            @else
                                                <span class="badge bg-secondary">Inactive</span>
                                            @endif
                                            
                                            @if($event->date->isPast())
                                                <span class="badge bg-dark ms-1">Ended</span>
                                            @elseif($event->date->isToday())
                                                <span class="badge bg-primary ms-1">Happening Today</span>
                                            @elseif($event->date->isFuture())
                                                <span class="badge bg-info ms-1">Upcoming</span>
                                            @endif
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Description</th>
                                        <td>{!! nl2br(e($event->description)) !!}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="mb-4">
                        <h4>Event Statistics</h4>
                        <div class="row">
                            <div class="col-md-4">
                                <div class="card bg-primary text-white mb-3">
                                    <div class="card-body text-center">
                                        <h2 class="mb-0">{{ $event->eventParticipants->count() }}</h2>
                                        <div>Total Registrations</div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="card bg-success text-white mb-3">
                                    <div class="card-body text-center">
                                        <h2 class="mb-0">{{ $event->eventParticipants->where('attendance_verified_at', '!==', null)->count() }}</h2>
                                        <div>Attended</div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="card bg-info text-white mb-3">
                                    <div class="card-body text-center">
                                        <h2 class="mb-0">{{ $event->certificates->count() }}</h2>
                                        <div>Certificates Issued</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-lg-4">
            <div class="card shadow-sm mb-4">
                <div class="card-header">
                    <h5 class="mb-0">Quick Actions</h5>
                </div>
                <div class="list-group list-group-flush">
                    <a href="#participants" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                        <span><i class="fas fa-users me-2"></i> View Participants</span>
                        <span class="badge bg-primary rounded-pill">{{ $event->eventParticipants->count() }}</span>
                    </a>
                    
                    @if($event->eventParticipants->count() > 0)
                        <a href="{{ route('admin.events.export', $event) }}" class="list-group-item list-group-item-action">
                            <i class="fas fa-file-export me-2"></i> Export to Excel
                        </a>
                    @endif
                    
                    @if($event->certificate_template_path)
                        <a href="#certificates" class="list-group-item list-group-item-action">
                            <i class="fas fa-certificate me-2"></i> Manage Certificates
                        </a>
                    @else
                        <div class="list-group-item text-muted">
                            <i class="fas fa-exclamation-circle me-2"></i> No certificate template uploaded
                        </div>
                    @endif
                    
                    @if($event->date->isPast())
                        <a href="#" class="list-group-item list-group-item-action text-success">
                            <i class="fas fa-check-circle me-2"></i> Event Completed
                        </a>
                    @elseif($event->date->isToday())
                        <a href="#attendance" class="list-group-item list-group-item-action text-primary">
                            <i class="fas fa-clipboard-check me-2"></i> Take Attendance
                        </a>
                    @else
                        <div class="list-group-item text-muted">
                            <i class="fas fa-calendar-alt me-2"></i> Event starts in {{ $event->date->diffForHumans() }}
                        </div>
                    @endif
                    
                    <div class="list-group-item">
                        <div class="d-grid">
                            <button type="button" class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#deleteEventModal">
                                <i class="fas fa-trash-alt me-1"></i> Delete Event
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card shadow-sm mb-4">
                <div class="card-header">
                    <h5 class="mb-0">Event QR Code</h5>
                </div>
                <div class="card-body text-center">
                    <div id="qrcode" class="mb-3"></div>
                    <p class="small text-muted">Scan this QR code for quick access to the event page</p>
                    <a href="#" class="btn btn-sm btn-outline-primary" id="downloadQR">
                        <i class="fas fa-download me-1"></i> Download QR Code
                    </a>
                </div>
            </div>
        </div>
    </div>

    <div class="row" id="participants">
        <div class="col-12">
            <div class="card shadow-sm">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Participants ({{ $event->eventParticipants->count() }})</h5>
                    <div>
                        <a href="{{ route('admin.events.export', $event) }}" class="btn btn-sm btn-outline-primary me-2">
                            <i class="fas fa-file-export me-1"></i> Export
                        </a>
                        <a href="#" class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#addParticipantModal">
                            <i class="fas fa-user-plus me-1"></i> Add Participant
                        </a>
                    </div>
                </div>
                <div class="card-body">
                    @if($event->eventParticipants->count() > 0)
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Institution</th>
                                        <th>Registered At</th>
                                        <th>Attendance</th>
                                        <th>Certificate</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($event->eventParticipants as $participant)
                                        <tr>
                                            <td>{{ $loop->iteration }}</td>
                                            <td>{{ $participant->participant->name }}</td>
                                            <td>{{ $participant->participant->email }}</td>
                                            <td>{{ $participant->participant->phone ?? 'N/A' }}</td>
                                            <td>{{ $participant->participant->institution ?? 'N/A' }}</td>
                                            <td>{{ $participant->created_at->format('M j, Y H:i') }}</td>
                                            <td>
                                                @if($participant->attendance_verified_at)
                                                    <span class="badge bg-success">Present</span>
                                                    <div class="small text-muted">{{ $participant->attendance_verified_at->format('M j, Y H:i') }}</div>
                                                @else
                                                    <span class="badge bg-secondary">Absent</span>
                                                @endif
                                            </td>
                                            <td>
                                                @if($participant->has_received_certificate)
                                                    <span class="badge bg-success">Issued</span>
                                                    <div class="small">
                                                        <a href="#" class="text-primary">View</a>
                                                    </div>
                                                @else
                                                    <span class="badge bg-secondary">Not Issued</span>
                                                    @if($participant->attendance_verified_at && $event->certificate_template_path)
                                                        <div class="small">
                                                            <a href="#" class="text-primary">Generate</a>
                                                        </div>
                                                    @endif
                                                @endif
                                            </td>
                                            <td>
                                                <div class="btn-group">
                                                    @if(!$participant->attendance_verified_at && $event->date->isToday())
                                                        <form action="{{ route('admin.events.mark-attendance', [$event, $participant]) }}" method="POST" class="d-inline">
                                                            @csrf
                                                            <button type="submit" class="btn btn-sm btn-outline-success" title="Mark as Present">
                                                                <i class="fas fa-check"></i>
                                                            </button>
                                                        </form>
                                                    @endif
                                                    
                                                    @if($participant->attendance_verified_at && !$participant->has_received_certificate && $event->certificate_template_path)
                                                        <form action="{{ route('admin.events.generate-certificate', [$event, $participant]) }}" method="POST" class="d-inline">
                                                            @csrf
                                                            <button type="submit" class="btn btn-sm btn-outline-primary" title="Generate Certificate">
                                                                <i class="fas fa-certificate"></i>
                                                            </button>
                                                        </form>
                                                    @endif
                                                    
                                                    <form action="{{ route('admin.events.remove-participant', [$event, $participant]) }}" method="POST" class="d-inline" onsubmit="return confirm('Are you sure you want to remove this participant?')">
                                                        @csrf
                                                        @method('DELETE')
                                                        <button type="submit" class="btn btn-sm btn-outline-danger" title="Remove">
                                                            <i class="fas fa-trash-alt"></i>
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
                            <div class="text-muted mb-3">No participants registered for this event yet.</div>
                            <a href="#" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addParticipantModal">
                                <i class="fas fa-user-plus me-1"></i> Add Participant
                            </a>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>

    @if($event->certificate_template_path)
        <div class="row mt-4" id="certificates">
            <div class="col-12">
                <div class="card shadow-sm">
                    <div class="card-header">
                        <h5 class="mb-0">Certificates</h5>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="card bg-light">
                                    <div class="card-body">
                                        <h6>Certificate Template</h6>
                                        <div class="d-flex align-items-center">
                                            <i class="fas fa-file-pdf fa-2x text-danger me-3"></i>
                                            <div>
                                                <div>Template: {{ basename($event->certificate_template_path) }}</div>
                                                <a href="{{ Storage::url($event->certificate_template_path) }}" target="_blank" class="btn btn-sm btn-outline-primary mt-2">
                                                    <i class="fas fa-eye me-1"></i> View Template
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="card bg-light">
                                    <div class="card-body">
                                        <h6>Certificate Generation</h6>
                                        <p class="small text-muted">Generate certificates for participants who attended the event.</p>
                                        
                                        @if($event->eventParticipants->where('attendance_verified_at', '!==', null)->count() > 0)
                                            @php
                                                $pendingCertificates = $event->eventParticipants
                                                    ->where('attendance_verified_at', '!==', null)
                                                    ->where('has_received_certificate', false)
                                                    ->count();
                                            @endphp
                                            
                                            @if($pendingCertificates > 0)
                                                <form action="{{ route('admin.events.generate-all-certificates', $event) }}" method="POST" class="mb-3">
                                                    @csrf
                                                    <button type="submit" class="btn btn-primary w-100">
                                                        <i class="fas fa-certificate me-1"></i> 
                                                        Generate {{ $pendingCertificates }} Pending Certificate{{ $pendingCertificates > 1 ? 's' : '' }}
                                                    </button>
                                                </form>
                                            @else
                                                <div class="alert alert-success mb-0">
                                                    <i class="fas fa-check-circle me-1"></i> All certificates have been generated.
                                                </div>
                                            @endif
                                            
                                            <div class="progress mt-3" style="height: 10px;">
                                                @php
                                                    $totalAttended = $event->eventParticipants->where('attendance_verified_at', '!==', null)->count();
                                                    $certificatesGenerated = $event->eventParticipants->where('has_received_certificate', true)->count();
                                                    $percentage = $totalAttended > 0 ? ($certificatesGenerated / $totalAttended) * 100 : 0;
                                                @endphp
                                                <div class="progress-bar bg-success" role="progressbar" style="width: {{ $percentage }}%" 
                                                     aria-valuenow="{{ $percentage }}" aria-valuemin="0" aria-valuemax="100">
                                                    {{ round($percentage) }}%
                                                </div>
                                            </div>
                                            <div class="small text-muted text-end mt-1">
                                                {{ $certificatesGenerated }} of {{ $totalAttended }} certificates generated
                                            </div>
                                        @else
                                            <div class="alert alert-warning mb-0">
                                                <i class="fas fa-info-circle me-1"></i> No participants have attended the event yet.
                                            </div>
                                        @endif
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        @if($event->certificates->count() > 0)
                            <div class="mt-4">
                                <h6>Generated Certificates</h6>
                                <div class="table-responsive">
                                    <table class="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Participant</th>
                                                <th>Certificate Number</th>
                                                <th>Issued At</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            @foreach($event->certificates as $certificate)
                                                <tr>
                                                    <td>{{ $loop->iteration }}</td>
                                                    <td>{{ $certificate->participant->name }}</td>
                                                    <td>{{ $certificate->certificate_number }}</td>
                                                    <td>{{ $certificate->created_at->format('M j, Y H:i') }}</td>
                                                    <td>
                                                        <a href="{{ route('admin.certificates.show', $certificate) }}" class="btn btn-sm btn-outline-primary" target="_blank">
                                                            <i class="fas fa-eye me-1"></i> View
                                                        </a>
                                                        <a href="{{ route('admin.certificates.download', $certificate) }}" class="btn btn-sm btn-outline-success">
                                                            <i class="fas fa-download me-1"></i> Download
                                                        </a>
                                                    </td>
                                                </tr>
                                            @endforeach
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    @endif
</div>

<!-- Delete Event Modal -->
<div class="modal fade" id="deleteEventModal" tabindex="-1" aria-labelledby="deleteEventModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="deleteEventModalLabel">Confirm Delete</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <p>Are you sure you want to delete this event? This action cannot be undone.</p>
                <p class="mb-0"><strong>Note:</strong> This will also remove all associated participants and certificates.</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <form action="{{ route('admin.events.destroy', $event) }}" method="POST">
                    @csrf
                    @method('DELETE')
                    <button type="submit" class="btn btn-danger">
                        <i class="fas fa-trash-alt me-1"></i> Delete Event
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>

<!-- Add Participant Modal -->
<div class="modal fade" id="addParticipantModal" tabindex="-1" aria-labelledby="addParticipantModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="addParticipantModalLabel">Add Participant</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form action="{{ route('admin.events.add-participant', $event) }}" method="POST">
                @csrf
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="name" class="form-label">Full Name <span class="text-danger">*</span></label>
                                <input type="text" class="form-control" id="name" name="name" required>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="email" class="form-label">Email <span class="text-danger">*</span></label>
                                <input type="email" class="form-control" id="email" name="email" required>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="phone" class="form-label">Phone</label>
                                <input type="tel" class="form-control" id="phone" name="phone">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="institution" class="form-label">Institution/Company</label>
                                <input type="text" class="form-control" id="institution" name="institution">
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="attendance_token" class="form-label">Attendance Token</label>
                                <div class="input-group">
                                    <input type="text" class="form-control" id="attendance_token" name="attendance_token" 
                                           value="{{ Str::random(10) }}" readonly>
                                    <button class="btn btn-outline-secondary" type="button" id="generateToken">
                                        <i class="fas fa-sync-alt"></i>
                                    </button>
                                </div>
                                <div class="form-text">This token will be used for attendance verification</div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label">Mark as Attended</label>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="mark_attended" name="mark_attended">
                                    <label class="form-check-label" for="mark_attended">
                                        Mark this participant as attended
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-user-plus me-1"></i> Add Participant
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Bulk Import Modal -->
<div class="modal fade" id="bulkImportModal" tabindex="-1" aria-labelledby="bulkImportModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="bulkImportModalLabel">Bulk Import Participants</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form action="{{ route('admin.events.import-participants', $event) }}" method="POST" enctype="multipart/form-data">
                @csrf
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="import_file" class="form-label">CSV/Excel File</label>
                        <input type="file" class="form-control" id="import_file" name="import_file" required>
                        <div class="form-text">
                            <a href="{{ asset('templates/participants_import_template.xlsx') }}" download>
                                <i class="fas fa-download me-1"></i> Download Template
                            </a>
                        </div>
                    </div>
                    <div class="form-check mb-3">
                        <input class="form-check-input" type="checkbox" id="generate_tokens" name="generate_tokens" checked>
                        <label class="form-check-label" for="generate_tokens">
                            Generate attendance tokens automatically
                        </label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-upload me-1"></i> Import Participants
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- QR Code Modal -->
<div class="modal fade" id="qrcodeModal" tabindex="-1" aria-labelledby="qrcodeModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-sm">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="qrcodeModalLabel">Event QR Code</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body text-center">
                <div id="qrcode-preview" class="mb-3"></div>
                <p class="small text-muted">Scan this QR code to view event details</p>
                <a href="#" class="btn btn-sm btn-outline-primary" id="downloadQRBtn">
                    <i class="fas fa-download me-1"></i> Download
                </a>
            </div>
        </div>
    </div>
</div>

@endsection

@push('scripts')
<!-- QR Code Library -->
<script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js"></script>

<script>
    // Generate QR Code
    document.addEventListener('DOMContentLoaded', function() {
        // Generate QR Code
        const qrCodeElement = document.getElementById('qrcode');
        const qrCodePreview = document.getElementById('qrcode-preview');
        const eventUrl = "{{ route('events.show', $event) }}";
        
        // Generate QR code for the card
        if (qrCodeElement) {
            new QRCode(qrCodeElement, {
                text: eventUrl,
                width: 200,
                height: 200,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        }
        
        // Generate QR code for the modal
        if (qrCodePreview) {
            new QRCode(qrCodePreview, {
                text: eventUrl,
                width: 300,
                height: 300,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        }
        
        // Download QR Code
        const downloadQR = document.getElementById('downloadQR');
        const downloadQRBtn = document.getElementById('downloadQRBtn');
        
        function downloadQRCode() {
            const canvas = document.querySelector('#qrcode canvas');
            const link = document.createElement('a');
            link.download = 'event-qr-code.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
        
        if (downloadQR) downloadQR.addEventListener('click', downloadQRCode);
        if (downloadQRBtn) downloadQRBtn.addEventListener('click', downloadQRCode);
        
        // Generate random token
        const generateTokenBtn = document.getElementById('generateToken');
        const tokenInput = document.getElementById('attendance_token');
        
        if (generateTokenBtn && tokenInput) {
            generateTokenBtn.addEventListener('click', function() {
                tokenInput.value = Math.random().toString(36).substring(2, 12).toUpperCase();
            });
        }
        
        // Initialize tooltips
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    });
</script>
@endpush

@push('styles')
<style>
    .card {
        margin-bottom: 1.5rem;
        border: none;
        box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    }
    
    .card-header {
        background-color: #f8f9fa;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }
    
    .table th {
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.75rem;
        letter-spacing: 0.5px;
        background-color: #f8f9fa;
    }
    
    .badge {
        font-weight: 500;
        padding: 0.35em 0.65em;
    }
    
    #qrcode, #qrcode-preview {
        display: inline-block;
        padding: 1rem;
        background: white;
        border: 1px solid #dee2e6;
        border-radius: 0.25rem;
    }
    
    .progress {
        height: 0.5rem;
    }
    
    .btn-group .btn {
        margin-right: 0.25rem;
    }
    
    .btn-group .btn:last-child {
        margin-right: 0;
    }
</style>
@endpush
