<?php

namespace App\Http\Controllers;

use App\Models\Rumah;
use App\Models\KartuKeluarga;
use App\Models\Penduduk;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class RumahController extends Controller
{
    /**
     * Display a listing of all houses.
     */
    public function index()
    {
        $rumah = Rumah::with(['kartuKeluarga.anggotaKeluarga', 'penduduk'])->get();
        
        return Inertia::render('data-kependudukan/rumah/index', [
            'rumah' => $rumah
        ]);
    }

    /**
     * Show the form for creating a new house.
     */
    public function create()
    {
        $kartuKeluargaList = KartuKeluarga::select('id', 'nomor_kk', 'alamat', 'rt', 'rw')
            ->orderBy('nomor_kk')
            ->get();
            
        return Inertia::render('data-kependudukan/rumah/create', [
            'kartuKeluargaList' => $kartuKeluargaList
        ]);
    }

    /**
     * Display the specified house.
     */
    public function show(Rumah $rumah)
    {
        $rumah->load(['kartuKeluarga.anggotaKeluarga', 'penduduk']);
        
        return Inertia::render('data-kependudukan/rumah/show', [
            'rumah' => $rumah
        ]);
    }

    /**
     * Show the form for editing the specified house.
     */
    public function edit(Rumah $rumah)
    {
        $kartuKeluargaList = KartuKeluarga::select('id', 'nomor_kk', 'alamat', 'rt', 'rw')
            ->orderBy('nomor_kk')
            ->get();
            
        return Inertia::render('data-kependudukan/rumah/edit', [
            'rumah' => $rumah,
            'kartuKeluargaList' => $kartuKeluargaList
        ]);
    }

    /**
     * Store a newly created house.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'kartu_keluarga_id' => 'nullable|exists:kartu_keluargas,id',
            'penduduk_id' => 'nullable|exists:penduduk,id',
            'alamat' => 'required|string',
            'rt' => 'required|string|max:3',
            'rw' => 'required|string|max:3',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'keterangan' => 'nullable|string',
            'foto_rumah' => 'nullable|image|mimes:jpeg,jpg,png|max:2048',
        ]);

        // Ensure at least one of kartu_keluarga_id or penduduk_id is provided
        if (empty($validated['kartu_keluarga_id']) && empty($validated['penduduk_id'])) {
            return back()->withErrors(['error' => 'Rumah harus terkait dengan Kartu Keluarga atau Penduduk.']);
        }

        // Handle file upload
        $fotoPath = null;
        if ($request->hasFile('foto_rumah')) {
            $fotoPath = $request->file('foto_rumah')->store('lokasi-penduduk', 'public');
        }

        Rumah::create([
            'kartu_keluarga_id' => $validated['kartu_keluarga_id'] ?? null,
            'penduduk_id' => $validated['penduduk_id'] ?? null,
            'alamat' => $validated['alamat'],
            'rt' => $validated['rt'],
            'rw' => $validated['rw'],
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'keterangan' => $validated['keterangan'] ?? null,
            'foto_rumah' => $fotoPath ? asset('storage/' . $fotoPath) : null,
        ]);

        return redirect()->route('data-kependudukan.lokasi-penduduk')->with('success', 'Lokasi rumah berhasil ditambahkan.');
    }

    /**
     * Update the specified house.
     */
    public function update(Request $request, Rumah $rumah)
    {
        $validated = $request->validate([
            'alamat' => 'sometimes|required|string',
            'rt' => 'sometimes|required|string|max:3',
            'rw' => 'sometimes|required|string|max:3',
            'latitude' => 'sometimes|required|numeric',
            'longitude' => 'sometimes|required|numeric',
            'keterangan' => 'nullable|string',
            'foto_rumah' => 'nullable|image|mimes:jpeg,jpg,png|max:2048',
        ]);

        // Handle file upload
        $fotoPath = $rumah->foto_rumah;
        if ($request->hasFile('foto_rumah')) {
            // Delete old file if exists
            if ($rumah->foto_rumah) {
                $oldPath = str_replace(asset('storage/'), '', $rumah->foto_rumah);
                Storage::disk('public')->delete($oldPath);
            }
            $newPath = $request->file('foto_rumah')->store('lokasi-penduduk', 'public');
            $fotoPath = asset('storage/' . $newPath);
        }

        $rumah->update([
            'alamat' => $validated['alamat'] ?? $rumah->alamat,
            'rt' => $validated['rt'] ?? $rumah->rt,
            'rw' => $validated['rw'] ?? $rumah->rw,
            'latitude' => $validated['latitude'] ?? $rumah->latitude,
            'longitude' => $validated['longitude'] ?? $rumah->longitude,
            'keterangan' => $validated['keterangan'] ?? $rumah->keterangan,
            'foto_rumah' => $fotoPath,
        ]);

        return redirect()->back()->with('success', 'Lokasi rumah berhasil diperbarui.');
    }

    /**
     * Remove the specified house.
     */
    public function destroy(Rumah $rumah)
    {
        // Delete foto if exists
        if ($rumah->foto_rumah) {
            $path = str_replace(asset('storage/'), '', $rumah->foto_rumah);
            Storage::disk('public')->delete($path);
        }

        $rumah->delete();
        
        return redirect()->back()->with('success', 'Lokasi rumah berhasil dihapus.');
    }

    /**
     * Get houses for a specific Kartu Keluarga (API endpoint)
     */
    public function getByKartuKeluarga($kartuKeluargaId)
    {
        $rumah = Rumah::where('kartu_keluarga_id', $kartuKeluargaId)->get();
        
        return response()->json($rumah);
    }
}
