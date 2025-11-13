<?php

namespace App\Http\Controllers;

use App\Models\DaftarHadir;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DaftarHadirController extends Controller
{
    public function index()
    {
        $data = DaftarHadir::where('user_id', Auth::id())->get();
        return response()->json($data);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tanggal' => 'required|date',
            'jam_masuk' => 'nullable|date_format:H:i',
            'jam_keluar' => 'nullable|date_format:H:i',
            'status' => 'required|in:hadir,izin,alpha'
        ]);

        $validated['user_id'] = Auth::id();

        $daftarHadir = DaftarHadir::create($validated);

        return response()->json(['message' => 'Data created successfully', 'data' => $daftarHadir]);
    }

    public function show($id)
    {
        $data = DaftarHadir::where('user_id', Auth::id())->findOrFail($id);
        return response()->json($data);
    }

    public function update(Request $request, $id)
    {
        $data = DaftarHadir::where('user_id', Auth::id())->findOrFail($id);

        $validated = $request->validate([
            'tanggal' => 'sometimes|date',
            'jam_masuk' => 'nullable|date_format:H:i',
            'jam_keluar' => 'nullable|date_format:H:i',
            'status' => 'sometimes|in:hadir,izin,alpha'
        ]);

        $data->update($validated);

        return response()->json(['message' => 'Data updated successfully', 'data' => $data]);
    }

    public function destroy($id)
    {
        $data = DaftarHadir::where('user_id', Auth::id())->findOrFail($id);
        $data->delete();

        return response()->json(['message' => 'Data deleted successfully']);
    }
}
