<?php

namespace App\Http\Controllers;


use App\Models\BatasWilayah;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BatasWilayahController extends Controller
{
    public function index()
    {
        $batasWilayah = BatasWilayah::all();
        return Inertia::render('batas-wilayah/index', [
            'batasWilayah' => $batasWilayah
        ]);
    }

    public function create()
    {
        return Inertia::render('batas-wilayah/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'jenis' => 'required|string|max:255',
            'nama_pemilik' => 'nullable|string|max:255',
            'no_hp_pemilik' => 'nullable|string|max:20',
            'alamat_pemilik' => 'nullable|string',
            'coordinates' => 'required|array',
            'warna' => 'required|string|max:7',
            'opacity' => 'required|numeric|min:0|max:1',
            'keterangan' => 'nullable|string',
        ]);

        BatasWilayah::create($validated);

        return redirect('/batas-wilayah')->with('success', 'Batas wilayah berhasil ditambahkan.');
    }

    public function edit($id)
    {
        $batasWilayah = BatasWilayah::findOrFail($id);
        return Inertia::render('batas-wilayah/edit', [
            'batasWilayah' => $batasWilayah
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'jenis' => 'required|string|max:255',
            'nama_pemilik' => 'nullable|string|max:255',
            'no_hp_pemilik' => 'nullable|string|max:20',
            'alamat_pemilik' => 'nullable|string',
            'coordinates' => 'required|array',
            'warna' => 'required|string|max:7',
            'opacity' => 'required|numeric|min:0|max:1',
            'keterangan' => 'nullable|string',
        ]);

        $batasWilayah = BatasWilayah::findOrFail($id);
        $batasWilayah->update($validated);

        return redirect('/batas-wilayah')->with('success', 'Batas wilayah berhasil diperbarui.');
    }

    public function show($id)
    {
        $batasWilayah = BatasWilayah::findOrFail($id);
        return Inertia::render('batas-wilayah/show', [
            'batasWilayah' => $batasWilayah,
        ]);
    }

    public function destroy($id)
    {
        $batasWilayah = BatasWilayah::findOrFail($id);
        $batasWilayah->delete();

        return redirect('/batas-wilayah')->with('success', 'Batas wilayah berhasil dihapus.');
    }

    public function apiMarkers()
    {
        $batasWilayah = BatasWilayah::all();
        return response()->json($batasWilayah);
    }
}
