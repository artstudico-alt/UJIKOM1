<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Event;

class EventOrganizerAccess
{
    /**
     * Handle an incoming request.
     * Ensures Event Organizers can only access events they created
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        if (!Auth::check()) {
            return redirect('login');
        }

        $user = Auth::user();
        
        // Admin can access everything
        if ($user->role === 'admin') {
            return $next($request);
        }
        
        // Check if user is an event organizer
        if ($user->role !== 'event_organizer') {
            return redirect()->route('dashboard')->with('error', 'Anda tidak memiliki akses ke halaman ini.');
        }
        
        // Get event ID from route parameters
        $eventId = $request->route('event') ?? $request->route('id') ?? $request->input('event_id');
        
        // If no event ID is provided, allow access (for listing own events, creating new events, etc.)
        if (!$eventId) {
            return $next($request);
        }
        
        // Check if the event belongs to this organizer
        $event = Event::find($eventId);
        
        if (!$event || $event->user_id !== $user->id) {
            return redirect()->route('organizer.dashboard')->with('error', 'Anda hanya dapat mengakses event yang Anda buat.');
        }
        
        return $next($request);
    }
}