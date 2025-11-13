<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\Certificate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\EventParticipantsExport;

class EventController extends Controller
{
    protected $perPage = 15;

    public function __construct()
    {
        $this->middleware(['auth', 'verified', 'is_admin']);
    }

    public function index()
    {
        $events = Event::withCount('eventParticipants')
            ->latest()
            ->paginate($this->perPage);
            
        return view('admin.events.index', compact('events'));
    }

    public function create()
    {
        return view('admin.events.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'location' => 'required|string|max:255',
            'max_participants' => 'nullable|integer|min:1',
            'registration_deadline' => 'required|date|before_or_equal:date',
            'flyer' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'certificate_template' => 'nullable|file|mimes:pdf,jpeg,png,jpg|max:5120',
        ]);

        // Check if event is being created at least 3 days before the event
        $eventDate = Carbon::parse($validated['date']);
        if ($eventDate->diffInDays(now()) < 3) {
            return back()->with('error', 'Event must be created at least 3 days before the event date.');
        }

        $event = new Event();
        $event->user_id = auth()->id();
        $event->title = $validated['title'];
        $event->description = $validated['description'];
        $event->date = $validated['date'];
        $event->start_time = $validated['start_time'];
        $event->end_time = $validated['end_time'];
        $event->location = $validated['location'];
        $event->max_participants = $validated['max_participants'] ?? null;
        $event->registration_deadline = $validated['registration_deadline'];
        $event->is_active = true;

        // Handle flyer upload
        if ($request->hasFile('flyer')) {
            $path = $request->file('flyer')->store('public/events/flyers');
            $event->flyer_path = Storage::url($path);
        }

        // Handle certificate template upload
        if ($request->hasFile('certificate_template')) {
            $path = $request->file('certificate_template')->store('public/events/certificates/templates');
            $event->certificate_template_path = Storage::url($path);
        }

        $event->save();

        return redirect()->route('admin.events.show', $event->id)
            ->with('success', 'Event created successfully.');
    }

    public function show($id)
    {
        $event = Event::findOrFail($id);
        return view('admin.events.show', compact('event'));
    }

    public function edit(Event $event)
    {
        return view('admin.events.edit', compact('event'));
    }

    public function update(Request $request, Event $event)
    {
        try {
            \DB::beginTransaction();
            
            // Debug: Log incoming request data
            \Log::info('Event update request received:', [
                'event_id' => $event->id,
                'title' => $request->input('title'),
                'description' => $request->input('description'),
                'date' => $request->input('date'),
                'start_time' => $request->input('start_time'),
                'end_time' => $request->input('end_time'),
                'location' => $request->input('location'),
                'max_participants' => $request->input('max_participants'),
                'registration_deadline' => $request->input('registration_deadline'),
                'is_active' => $request->input('is_active'),
                'is_active_has' => $request->has('is_active'),
                'is_active_raw' => $request->get('is_active'),
                'all_request_data' => $request->all(),
                'request_method' => $request->method(),
                'content_type' => $request->header('Content-Type')
            ]);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i',
            'location' => 'required|string|max:255',
            'max_participants' => 'nullable|integer|min:1',
            'registration_deadline' => 'required|date',
            'flyer' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'certificate_template' => 'nullable|file|mimes:pdf,jpeg,png,jpg|max:5120',
            'is_active' => 'nullable|boolean',
        ]);

        // Handle is_active checkbox properly
        $validated['is_active'] = $request->has('is_active') ? (bool)$request->input('is_active') : false;
        
        // Use update method like API controller
        $event->update($validated);

        // Handle file uploads (after main update)
        if ($request->hasFile('flyer')) {
            // Delete old flyer if exists
            if ($event->flyer_path) {
                Storage::disk('public')->delete($event->flyer_path);
            }
            $path = $request->file('flyer')->store('events/flyers', 'public');
            $event->flyer_path = $path;
            $event->save();
        }

        if ($request->hasFile('certificate_template')) {
            // Delete old template if exists
            if ($event->certificate_template_path) {
                Storage::disk('public')->delete($event->certificate_template_path);
            }
            $path = $request->file('certificate_template')->store('events/certificates/templates', 'public');
            $event->certificate_template_path = $path;
            $event->save();
        }

            // Refresh the model to get updated data from database
            $event->refresh();
            
            \DB::commit();
            
            // Debug: Log event data after update
            \Log::info('Event updated successfully:', [
                'event_id' => $event->id,
                'title' => $event->title,
                'description' => $event->description,
                'date' => $event->date,
                'start_time' => $event->start_time,
                'end_time' => $event->end_time,
                'location' => $event->location,
                'max_participants' => $event->max_participants,
                'registration_deadline' => $event->registration_deadline,
                'is_active' => $event->is_active
            ]);

            return redirect()->route('admin.events.show', $event->id)
                ->with('success', 'Event updated successfully.');
                
        } catch (\Exception $e) {
            \DB::rollBack();
            \Log::error('Error updating event: ' . $e->getMessage());
            
            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal memperbarui event: ' . $e->getMessage());
        }
    }

    public function destroy(Event $event)
    {
        // Delete associated files
        if ($event->flyer_path) {
            Storage::delete(str_replace('/storage', 'public', $event->flyer_path));
        }
        if ($event->certificate_template_path) {
            Storage::delete(str_replace('/storage', 'public', $event->certificate_template_path));
        }

        $event->delete();

        return redirect()->route('admin.events.index')
            ->with('success', 'Event deleted successfully.');
    }
    
    // Additional methods for event management
    public function participants(Event $event)
    {
        $participants = $event->eventParticipants()
            ->with('participant')
            ->latest()
            ->paginate($this->perPage);
            
        return view('admin.events.participants', compact('event', 'participants'));
    }
    
    public function exportParticipants(Event $event)
    {
        return Excel::download(new EventParticipantsExport($event), "event_{$event->id}_participants.xlsx");
    }
    
    public function generateCertificates(Event $event)
    {
        if (!$event->certificate_template_path) {
            return back()->with('error', 'No certificate template uploaded for this event.');
        }
        
        $participants = $event->eventParticipants()
            ->where('attendance_verified_at', '!=', null)
            ->where('has_received_certificate', false)
            ->with('participant')
            ->get();
            
        if ($participants->isEmpty()) {
            return back()->with('error', 'No eligible participants found for certificate generation.');
        }
        
        foreach ($participants as $participant) {
            $this->generateCertificate($event, $participant);
        }
        
        return back()->with('success', 'Certificates generated successfully for ' . $participants->count() . ' participants.');
    }
    
    protected function generateCertificate($event, $participant)
    {
        // Generate certificate PDF using DomPDF
        $pdf = Pdf::loadView('certificates.template', [
            'event' => $event,
            'participant' => $participant->participant,
            'certificateNumber' => Str::uuid(),
        ]);
        
        $filename = "certificate_{$event->id}_{$participant->id}_" . time() . '.pdf';
        $path = "public/certificates/{$filename}";
        
        // Save the PDF to storage
        Storage::put($path, $pdf->output());
        
        // Create certificate record
        Certificate::create([
            'event_id' => $event->id,
            'participant_id' => $participant->participant_id,
            'event_participant_id' => $participant->id,
            'certificate_number' => Str::uuid(),
            'certificate_path' => Storage::url($path),
            'issued_at' => now(),
        ]);
        
        // Update participant's certificate status
        $participant->update(['has_received_certificate' => true]);
    }
}
