<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\User;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\EventParticipantsExport;
use Illuminate\Support\Str;

class ParticipantController extends Controller
{
    protected $perPage = 15;

    public function __construct()
    {
        $this->middleware(['auth', 'verified', 'is_admin']);
    }

    /**
     * Display a listing of all events for participant selection
     */
    public function index()
    {
        $events = Event::withCount('eventParticipants')
            ->latest()
            ->paginate($this->perPage);
            
        return view('admin.participants.index', compact('events'));
    }

    /**
     * Display participants for a specific event
     */
    public function eventParticipants(Event $event)
    {
        $participants = $event->eventParticipants()
            ->with('participant')
            ->latest()
            ->paginate($this->perPage);
            
        return view('admin.participants.event_participants', compact('event', 'participants'));
    }

    /**
     * Display all participants across all events with event filter
     */
    public function allParticipants(Request $request)
    {
        $query = EventParticipant::with(['participant', 'event']);
        
        // Filter by event if provided
        if ($request->has('event_id') && $request->event_id) {
            $query->where('event_id', $request->event_id);
        }
        
        $participants = $query->latest()->paginate($this->perPage);
        $events = Event::orderBy('title')->get();
        
        return view('admin.participants.all', compact('participants', 'events'));
    }
    
    /**
     * Export participants data
     */
    public function export(Request $request)
    {
        $eventId = $request->input('event_id');
        $fileName = 'participants.xlsx';
        
        if ($eventId) {
            $event = Event::findOrFail($eventId);
            $fileName = 'participants_' . Str::slug($event->title) . '.xlsx';
        }
        
        return Excel::download(new EventParticipantsExport($eventId), $fileName);
    }
}