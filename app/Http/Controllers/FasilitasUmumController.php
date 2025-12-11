<?php

namespace App\Http\Controllers;

use App\Models\FasilitasUmum;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FasilitasUmumController extends Controller
{
    public function index()
    {
        $fasilitasUmum = FasilitasUmum::all();
        return Inertia::render('fasilitas/umum/index', [
            'fasilitasUmum' => $fasilitasUmum
        ]);
    }

    public function create()
    {
        return Inertia::render('fasilitas/umum/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'jenis' => 'required|string|max:255',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'alamat' => 'nullable|string',
            'keterangan' => 'nullable|string',
        ]);

        FasilitasUmum::create($validated);

        return redirect('/fasilitas/umum')->with('success', 'Fasilitas umum berhasil ditambahkan.');
    }

    public function edit($id)
    {
        $fasilitas = FasilitasUmum::findOrFail($id);
        return Inertia::render('fasilitas/umum/edit', [
            'fasilitas' => $fasilitas
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'jenis' => 'required|string|max:255',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'alamat' => 'nullable|string',
            'keterangan' => 'nullable|string',
        ]);

        $fasilitas = FasilitasUmum::findOrFail($id);
        $fasilitas->update($validated);

        return redirect('/fasilitas/umum')->with('success', 'Fasilitas umum berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $fasilitas = FasilitasUmum::findOrFail($id);
        $fasilitas->delete();

        return redirect('/fasilitas/umum')->with('success', 'Fasilitas umum berhasil dihapus.');
    }
}
