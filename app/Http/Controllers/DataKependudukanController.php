<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

use App\Models\Penduduk;
use App\Models\Rumah;

class DataKependudukanController extends Controller
{
    public function lokasiPenduduk()
    {
        // Get houses from the rumah table with their relationships
        $rumah = Rumah::with(['kartuKeluarga.anggotaKeluarga', 'penduduk'])->get();
        
        // Also get individual penduduk with locations (for backward compatibility)
        $penduduk = Penduduk::with(['kartuKeluarga.anggotaKeluarga'])
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->get();
        
        return Inertia::render('data-kependudukan/lokasi-penduduk/index', [
            'rumah' => $rumah,
            'penduduk' => $penduduk
        ]);
    }

    public function create()
    {
        $kartuKeluargaList = \App\Models\KartuKeluarga::select('id', 'nomor_kk', 'alamat', 'rt', 'rw')
            ->orderBy('nomor_kk')
            ->get();
            
        return Inertia::render('data-kependudukan/lokasi-penduduk/create', [
            'kartuKeluargaList' => $kartuKeluargaList
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nik' => 'required|string|max:16',
            'nama_lengkap' => 'required|string|max:255',
            'jenis_kelamin' => 'nullable|in:L,P',
            'tempat_lahir' => 'nullable|string|max:255',
            'tanggal_lahir' => 'nullable|date',
            'alamat' => 'required|string',
            'rt' => 'required|string|max:3',
            'rw' => 'required|string|max:3',
            'status_perkawinan' => 'nullable|string|max:50',
            'pekerjaan' => 'nullable|string|max:255',
            'keterangan' => 'nullable|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'foto_rumah' => 'nullable|image|mimes:jpeg,jpg,png|max:2048',
        ]);

        // Handle file upload
        $fotoPath = null;
        if ($request->hasFile('foto_rumah')) {
            $fotoPath = $request->file('foto_rumah')->store('lokasi-penduduk', 'public');
        }

        // Check if NIK already exists
        $existingPenduduk = Penduduk::where('nik', $validated['nik'])->first();
        $message = 'Data penduduk berhasil ditambahkan.';
        
        if ($existingPenduduk) {
            $message = 'Data penduduk berhasil ditambahkan. PERHATIAN: NIK ' . $validated['nik'] . ' sudah terdaftar atas nama ' . $existingPenduduk->nama_lengkap . '.';
        }

        // Create Penduduk
        $penduduk = Penduduk::create($validated);

        // Also create a Rumah entry so it appears on the map
        Rumah::create([
            'penduduk_id' => $penduduk->id,
            'alamat' => $validated['alamat'],
            'rt' => $validated['rt'],
            'rw' => $validated['rw'],
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'keterangan' => $validated['keterangan'] ?? null,
            'foto_rumah' => $fotoPath ? asset('storage/' . $fotoPath) : null,
        ]);

        return redirect()->route('data-kependudukan.lokasi-penduduk')->with('success', $message);
    }

    public function showRumah($id)
    {
        $rumah = Rumah::with(['kartuKeluarga.anggotaKeluarga'])->findOrFail($id);
        return Inertia::render('data-kependudukan/lokasi-penduduk/show', [
            'rumah' => $rumah,
        ]);
    }

    public function editRumah($id)
    {
        $rumah = Rumah::with(['kartuKeluarga.anggotaKeluarga'])->findOrFail($id);
        $kartuKeluargaList = \App\Models\KartuKeluarga::select('id', 'nomor_kk', 'alamat', 'rt', 'rw')
            ->orderBy('nomor_kk')
            ->get();
        
        return Inertia::render('data-kependudukan/lokasi-penduduk/edit', [
            'rumah' => $rumah,
            'kartuKeluargaList' => $kartuKeluargaList
        ]);
    }

    public function updateRumah(Request $request, $id)
    {
        $validated = $request->validate([
            'alamat' => 'required|string',
            'rt' => 'required|string|max:3',
            'rw' => 'required|string|max:3',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'keterangan' => 'nullable|string',
            'foto_rumah' => 'nullable|image|mimes:jpeg,jpg,png|max:2048',
        ]);

        $rumah = Rumah::findOrFail($id);
        
        // Handle file upload
        if ($request->hasFile('foto_rumah')) {
            if ($rumah->foto_rumah) {
                $oldPath = str_replace(asset('storage/'), '', $rumah->foto_rumah);
                Storage::disk('public')->delete($oldPath);
            }
            $fotoPath = $request->file('foto_rumah')->store('lokasi-penduduk', 'public');
            $validated['foto_rumah'] = asset('storage/' . $fotoPath);
        }

        $rumah->update($validated);

        return redirect()->route('data-kependudukan.lokasi-penduduk')->with('success', 'Lokasi rumah berhasil diperbarui.');
    }

    public function destroyRumah($id)
    {
        $rumah = Rumah::findOrFail($id);
        
        // Delete foto if exists
        if ($rumah->foto_rumah) {
            $path = str_replace(asset('storage/'), '', $rumah->foto_rumah);
            Storage::disk('public')->delete($path);
        }

        $rumah->delete();
        return redirect()->route('data-kependudukan.lokasi-penduduk')->with('success', 'Lokasi rumah berhasil dihapus.');
    }

    public function updateLocation(Request $request, $id)
    {
        $validated = $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        $penduduk = Penduduk::findOrFail($id);
        $penduduk->update($validated);

        return redirect()->back()->with('success', 'Lokasi penduduk berhasil diperbarui.');
    }
}
