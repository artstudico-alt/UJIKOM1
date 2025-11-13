<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PublicController extends Controller
{
    public function catalog()
    {
        return response()->json(['page' => 'public.catalog']);
    }

    public function eventDetail($id)
    {
        return response()->json(['page' => 'public.event_detail', 'id' => $id]);
    }

    public function searchEvents(Request $request)
    {
        return response()->json(['page' => 'public.search_events', 'q' => $request->input('q')]);
    }

    public function searchCertificate(Request $request)
    {
        return response()->json(['page' => 'public.search_certificate', 'q' => $request->input('q')]);
    }

    public function attendanceView(Request $request)
    {
        return response()->json(['page' => 'public.attendance_view']);
    }
}
