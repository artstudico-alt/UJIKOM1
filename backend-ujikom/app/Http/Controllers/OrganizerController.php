<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Carbon\Carbon;

class OrganizerController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'role:event_organizer,admin']);
    }

    /**
     * Display the organizer dashboard
     */
    public function dashboard()
    {
        $user = Auth::user();
        
        // Get events created by this organizer
        $events = Event::where('user_id', $user->id)
            ->orderBy('date', 'desc')
            ->get();
            
        // Categorize events
        $upcomingEvents = $events->filter(function($event) {
            return Carbon::parse($event->date)->isFuture();
        });
        
        $ongoingEvents = $events->filter(function($event) {
            return Carbon::parse($event->date)->isToday();
        });
        
        $completedEvents = $events->filter(function($event) {
            return Carbon::parse($event->date)->isPast() && !Carbon::parse($event->date)->isToday();
        });
        
        // Get total participants across all events
        $totalParticipants = EventParticipant::whereIn('event_id', $events->pluck('id'))->count();
        
        return view('organizer.dashboard', compact(
            'upcomingEvents', 
            'ongoingEvents', 
            'completedEvents', 
            'totalParticipants'
        ));
    }
    
    /**
     * Show the form for creating a new event
     */
    public function createEvent()
    {
        return view('organizer.events.create');
    }
    
    /**
     * Store a newly created event
     */
    public function storeEvent(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'date' => 'required|date|after_or_equal:today',
            'start_time' => 'required',
            'end_time' => 'required|after:start_time',
            'location' => 'required|string|max:255',
            'flyer' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'max_participants' => 'nullable|integer|min:1',
            'registration_deadline' => 'nullable|date|before_or_equal:date',
            'has_certificate' => 'boolean',
            'certificate_template' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);
        
        $event = new Event();
        $event->user_id = Auth::id();
        $event->title = $request->title;
        $event->description = $request->description;
        $event->date = $request->date;
        $event->start_time = $request->start_time;
        $event->end_time = $request->end_time;
        $event->location = $request->location;
        $event->max_participants = $request->max_participants;
        $event->registration_deadline = $request->registration_deadline;
        $event->has_certificate = $request->has_certificate ?? false;
        $event->is_active = true;
        
        // Handle flyer upload
        if ($request->hasFile('flyer')) {
            $flyerPath = $request->file('flyer')->store('public/events/flyers');
            $event->flyer_path = str_replace('public/', '', $flyerPath);
        }
        
        // Handle certificate template upload
        if ($request->hasFile('certificate_template')) {
            $certificatePath = $request->file('certificate_template')->store('public/events/certificates/templates');
            $event->certificate_template_path = str_replace('public/', '', $certificatePath);
        }
        
        $event->save();
        
        // Create notification for admin
        $adminUsers = User::where('role', 'admin')->get();
        foreach ($adminUsers as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'event_id' => $event->id,
                'title' => 'Event Baru Dibuat',
                'message' => 'Event baru "' . $event->title . '" telah dibuat oleh ' . Auth::user()->name,
                'type' => 'event_created',
                'is_read' => false
            ]);
        }
        
        return redirect()->route('organizer.events.show', $event->id)
            ->with('success', 'Event berhasil dibuat!');
    }
    
    /**
     * Display the specified event
     */
    public function showEvent($id)
    {
        $event = Event::findOrFail($id);
        
        // Check if the event belongs to this organizer
        if ($event->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return redirect()->route('organizer.dashboard')
                ->with('error', 'Anda tidak memiliki akses ke event ini.');
        }
        
        $participants = $event->participants;
        $participantsCount = $participants->count();
        $attendedCount = $event->eventParticipants()->whereNotNull('attendance_verified_at')->count();
        
        return view('organizer.events.show', compact('event', 'participants', 'participantsCount', 'attendedCount'));
    }
    
    /**
     * Show the form for editing the specified event
     */
    public function editEvent($id)
    {
        $event = Event::findOrFail($id);
        
        // Check if the event belongs to this organizer
        if ($event->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return redirect()->route('organizer.dashboard')
                ->with('error', 'Anda tidak memiliki akses ke event ini.');
        }
        
        return view('organizer.events.edit', compact('event'));
    }
    
    /**
     * Update the specified event
     */
    public function updateEvent(Request $request, $id)
    {
        $event = Event::findOrFail($id);
        
        // Check if the event belongs to this organizer
        if ($event->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return redirect()->route('organizer.dashboard')
                ->with('error', 'Anda tidak memiliki akses ke event ini.');
        }
        
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required|after:start_time',
            'location' => 'required|string|max:255',
            'flyer' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'max_participants' => 'nullable|integer|min:1',
            'registration_deadline' => 'nullable|date|before_or_equal:date',
            'has_certificate' => 'boolean',
            'certificate_template' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);
        
        $event->title = $request->title;
        $event->description = $request->description;
        $event->date = $request->date;
        $event->start_time = $request->start_time;
        $event->end_time = $request->end_time;
        $event->location = $request->location;
        $event->max_participants = $request->max_participants;
        $event->registration_deadline = $request->registration_deadline;
        $event->has_certificate = $request->has_certificate ?? false;
        
        // Handle flyer upload
        if ($request->hasFile('flyer')) {
            // Delete old flyer if exists
            if ($event->flyer_path) {
                Storage::delete('public/' . $event->flyer_path);
            }
            
            $flyerPath = $request->file('flyer')->store('public/events/flyers');
            $event->flyer_path = str_replace('public/', '', $flyerPath);
        }
        
        // Handle certificate template upload
        if ($request->hasFile('certificate_template')) {
            // Delete old template if exists
            if ($event->certificate_template_path) {
                Storage::delete('public/' . $event->certificate_template_path);
            }
            
            $certificatePath = $request->file('certificate_template')->store('public/events/certificates/templates');
            $event->certificate_template_path = str_replace('public/', '', $certificatePath);
        }
        
        $event->save();
        
        // Create notification for admin about event update
        $adminUsers = User::where('role', 'admin')->get();
        foreach ($adminUsers as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'event_id' => $event->id,
                'title' => 'Event Diperbarui',
                'message' => 'Event "' . $event->title . '" telah diperbarui oleh ' . Auth::user()->name,
                'type' => 'event_updated',
                'is_read' => false
            ]);
        }
        
        return redirect()->route('organizer.events.show', $event->id)
            ->with('success', 'Event berhasil diperbarui!');
    }
    
    /**
     * Remove the specified event
     */
    public function destroyEvent($id)
    {
        $event = Event::findOrFail($id);
        
        // Check if the event belongs to this organizer
        if ($event->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return redirect()->route('organizer.dashboard')
                ->with('error', 'Anda tidak memiliki akses ke event ini.');
        }
        
        // Delete flyer if exists
        if ($event->flyer_path) {
            Storage::delete('public/' . $event->flyer_path);
        }
        
        // Delete certificate template if exists
        if ($event->certificate_template_path) {
            Storage::delete('public/' . $event->certificate_template_path);
        }
        
        $event->delete();
        
        return redirect()->route('organizer.dashboard')
            ->with('success', 'Event berhasil dihapus!');
    }
    
    /**
     * Display the participants of an event
     */
    public function eventParticipants($id)
    {
        $event = Event::findOrFail($id);
        
        // Check if the event belongs to this organizer
        if ($event->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return redirect()->route('organizer.dashboard')
                ->with('error', 'Anda tidak memiliki akses ke event ini.');
        }
        
        $participants = $event->participants;
        
        return view('organizer.events.participants', compact('event', 'participants'));
    }
    
    /**
     * Upload event documents/photos
     */
    public function uploadEventDocuments(Request $request, $id)
    {
        $event = Event::findOrFail($id);
        
        // Check if the event belongs to this organizer
        if ($event->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return redirect()->route('organizer.dashboard')
                ->with('error', 'Anda tidak memiliki akses ke event ini.');
        }
        
        $request->validate([
            'documents.*' => 'required|file|max:5120', // 5MB max
            'notes' => 'nullable|string'
        ]);
        
        if ($request->hasFile('documents')) {
            foreach ($request->file('documents') as $file) {
                $path = $file->store('public/events/documents/' . $event->id);
                
                // Save document info in database (you might need to create a Document model)
                $event->documents()->create([
                    'path' => str_replace('public/', '', $path),
                    'filename' => $file->getClientOriginalName(),
                    'notes' => $request->notes,
                    'uploaded_by' => Auth::id()
                ]);
            }
        }
        
        return redirect()->route('organizer.events.show', $event->id)
            ->with('success', 'Dokumen berhasil diunggah!');
    }
    
    /**
     * Send event report to admin
     */
    public function sendEventReport(Request $request, $id)
    {
        $event = Event::findOrFail($id);
        
        // Check if the event belongs to this organizer
        if ($event->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return redirect()->route('organizer.dashboard')
                ->with('error', 'Anda tidak memiliki akses ke event ini.');
        }
        
        $request->validate([
            'report_content' => 'required|string',
            'attachments.*' => 'nullable|file|max:5120' // 5MB max
        ]);
        
        // Create notification for admin
        $adminUsers = User::where('role', 'admin')->get();
        foreach ($adminUsers as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'event_id' => $event->id,
                'title' => 'Laporan Event',
                'message' => 'Laporan untuk event "' . $event->title . '" telah dikirim oleh ' . Auth::user()->name,
                'type' => 'event_report',
                'data' => json_encode([
                    'report_content' => $request->report_content
                ]),
                'is_read' => false
            ]);
        }
        
        // Handle attachments if any
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('public/events/reports/' . $event->id);
                
                // Save attachment info (you might need to create a Report model)
                $event->reports()->create([
                    'path' => str_replace('public/', '', $path),
                    'filename' => $file->getClientOriginalName(),
                    'content' => $request->report_content,
                    'submitted_by' => Auth::id()
                ]);
            }
        }
        
        return redirect()->route('organizer.events.show', $event->id)
            ->with('success', 'Laporan berhasil dikirim ke admin!');
    }
}