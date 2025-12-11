<?php

namespace App\Http\Controllers;

use App\Models\LokasiPenting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LokasiPentingController extends Controller
{
    public function index(Request $request): Response
    {
        $query = LokasiPenting::query()->with('desa');

        // Filter by kategori
        if ($request->has('kategori') && $request->kategori) {
            $query->where('kategori', $request->kategori);
        }

        // Search by nama
        if ($request->has('search') && $request->search) {
            $query->where('nama', 'like', '%' . $request->search . '%');
        }

        $locations = $query->get();

        return Inertia::render('manajemen-data/lokasi-penting/index', [
            'locations' => $locations,
            'filters' => $request->only(['kategori', 'search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'desa_id' => 'required|exists:desa,id',
            'nama' => 'required|string|max:255',
            'kategori' => 'required|in:kantor_desa,sekolah,posyandu,masjid,puskesmas,taman,pasar,lainnya',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'deskripsi' => 'nullable|string',
            'foto' => 'nullable|string',
        ]);

        LokasiPenting::create($validated);

        return redirect()->route('lokasi-penting.index')
            ->with('success', 'Lokasi penting berhasil ditambahkan');
    }

    public function update(Request $request, LokasiPenting $lokasiPenting)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'kategori' => 'required|in:kantor_desa,sekolah,posyandu,masjid,puskesmas,taman,pasar,lainnya',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'deskripsi' => 'nullable|string',
            'foto' => 'nullable|string',
        ]);

        $lokasiPenting->update($validated);

        return redirect()->route('lokasi-penting.index')
            ->with('success', 'Lokasi penting berhasil diperbarui');
    }

    public function destroy(LokasiPenting $lokasiPenting)
    {
        $lokasiPenting->delete();

        return redirect()->route('lokasi-penting.index')
            ->with('success', 'Lokasi penting berhasil dihapus');
    }
}
