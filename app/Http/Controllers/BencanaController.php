<?php

namespace App\Http\Controllers;

use App\Models\Bencana;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class BencanaController extends Controller
{
    public function berlangsung()
    {
        $bencana = Bencana::berlangsung()
            ->orderBy('tanggal_mulai', 'desc')
            ->get();

        return Inertia::render('bencana/berlangsung', [
            'bencana' => $bencana
        ]);
    }

    public function riwayat()
    {
        $bencana = Bencana::selesai()
            ->orderBy('tanggal_selesai', 'desc')
            ->get();

        return Inertia::render('bencana/riwayat', [
            'bencana' => $bencana
        ]);
    }

    public function create()
    {
        return Inertia::render('bencana/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_bencana' => 'required|string|max:255',
            'jenis_bencana' => 'required|in:banjir,longsor,gempa,kebakaran,angin_puting_beliung,kekeringan,lainnya',
            'tipe_lokasi' => 'required|in:titik,polygon,radius',
            'lokasi_data' => 'required|array',
            'tanggal_mulai' => 'required|date',
            'tingkat_bahaya' => 'required|in:rendah,sedang,tinggi,sangat_tinggi',
            'korban_jiwa' => 'nullable|integer|min:0',
            'korban_luka' => 'nullable|integer|min:0',
            'kerusakan_infrastruktur' => 'nullable|string',
            'keterangan' => 'required|string',
            'foto' => 'nullable|image|mimes:jpeg,jpg,png|max:2048',
        ]);

        // Handle file upload
        $fotoPath = null;
        if ($request->hasFile('foto')) {
            $fotoPath = $request->file('foto')->store('bencana', 'public');
        }

        $bencana = Bencana::create([
            ...$validated,
            'foto' => $fotoPath ? asset('storage/' . $fotoPath) : null,
        ]);

        return redirect()->route('bencana.berlangsung')->with('success', 'Data bencana berhasil ditambahkan.');
    }

    public function edit(Bencana $bencana)
    {
        return Inertia::render('bencana/create', [
            'bencana' => $bencana
        ]);
    }

    public function update(Request $request, Bencana $bencana)
    {
        $validated = $request->validate([
            'nama_bencana' => 'required|string|max:255',
            'jenis_bencana' => 'required|in:banjir,longsor,gempa,kebakaran,angin_puting_beliung,kekeringan,lainnya',
            'tipe_lokasi' => 'required|in:titik,polygon,radius',
            'lokasi_data' => 'required|array',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'nullable|date|after:tanggal_mulai',
            'status' => 'required|in:berlangsung,selesai',
            'tingkat_bahaya' => 'required|in:rendah,sedang,tinggi,sangat_tinggi',
            'korban_jiwa' => 'nullable|integer|min:0',
            'korban_luka' => 'nullable|integer|min:0',
            'kerusakan_infrastruktur' => 'nullable|string',
            'keterangan' => 'required|string',
            'foto' => 'nullable|image|mimes:jpeg,jpg,png|max:2048',
        ]);

        // Handle file upload
        $fotoPath = $bencana->foto;
        if ($request->hasFile('foto')) {
            if ($bencana->foto) {
                $oldPath = str_replace(asset('storage/'), '', $bencana->foto);
                Storage::disk('public')->delete($oldPath);
            }
            $newPath = $request->file('foto')->store('bencana', 'public');
            $fotoPath = asset('storage/' . $newPath);
        }

        $bencana->update([
            ...$validated,
            'foto' => $fotoPath,
        ]);

        $redirectRoute = $bencana->status === 'selesai' ? 'bencana.riwayat' : 'bencana.berlangsung';
        return redirect()->route($redirectRoute)->with('success', 'Data bencana berhasil diperbarui.');
    }

    public function destroy(Bencana $bencana)
    {
        // Delete foto if exists
        if ($bencana->foto) {
            $path = str_replace(asset('storage/'), '', $bencana->foto);
            Storage::disk('public')->delete($path);
        }

        $bencana->delete();
        return redirect()->back()->with('success', 'Data bencana berhasil dihapus.');
    }

    public function show(Bencana $bencana)
    {
        return Inertia::render('bencana/show', [
            'bencana' => $bencana,
        ]);
    }

    public function selesaikan(Bencana $bencana)
    {
        $bencana->update([
            'status' => 'selesai',
            'tanggal_selesai' => now(),
        ]);

        return redirect()->route('bencana.riwayat')->with('success', 'Bencana telah ditandai selesai.');
    }

    /**
     * Get all disasters for API markers.
     */
    public function apiMarkers(Request $request)
    {
        $status = $request->query('status');
        
        $query = Bencana::query();
        
        if ($status === 'berlangsung') {
            $query->berlangsung();
        } elseif ($status === 'selesai') {
            $query->selesai();
        }
        
        $bencana = $query->get();
        return response()->json($bencana);
    }
}
