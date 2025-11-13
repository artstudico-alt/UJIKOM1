<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OrganizerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();

        // Placeholder data for the organizer dashboard
        $stats = [
            'total_events' => 0,
            'total_participants' => 0,
            'upcoming_events' => 0,
            'revenue' => 0,
        ];

        return response()->json([
            'message' => 'Welcome to your Event Organizer dashboard!',
            'user' => $user->only(['name', 'email', 'role']),
            'stats' => $stats
        ]);
    }
}
