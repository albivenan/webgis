<?php

namespace App\Http\Controllers;

use App\Models\Desa;
use App\Models\Fasilitas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class FasilitasController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $tipeAkses = $request->query('tipe', 'umum'); // Default to 'umum' if not specified

        $fasilitas = Fasilitas::with('desa')
            ->when($tipeAkses, function ($query, $tipeAkses) {
                return $query->where('tipe_akses', $tipeAkses);
            })
            ->get();

        if ($tipeAkses === 'jalan') {
            return Inertia::render('fasilitas/jalan/index', [
                'fasilitas' => $fasilitas,
                'tipeAkses' => $tipeAkses,
            ]);
        }

        return Inertia::render('fasilitas/index', [
            'fasilitas' => $fasilitas,
            'tipeAkses' => $tipeAkses,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $desa = Desa::all();
        $tipeAkses = $request->query('tipe', 'umum'); // Default to 'umum'

        $jenisOptions = [
            'sekolah_sd', 'sekolah_smp', 'sekolah_sma', 'universitas',
            'masjid', 'mushola', 'gereja', 'pura', 'vihara',
            'puskesmas', 'klinik', 'rumah_sakit_umum', 'posyandu',
            'kantor_desa_kelurahan', 'kantor_kecamatan', 'kantor_pemerintah_dinas_instansi',
            'balai_desa_pertemuan', 'pasar_tradisional', 'terminal_halte',
            'pos_polisi', 'pos_damkar', 'lapangan_taman', 'stadion_gor',
            'perpustakaan_daerah', 'tempat_pemakaman_umum_tpu', 'kantor_pos'
        ];

        if ($tipeAkses === 'jalan') {
            $jenisOptions = [
                'jalan_nasional', 'jalan_provinsi', 'jalan_kabupaten', 'jalan_desa', 'jalan_lingkungan', 'jalan_setapak'
            ];
            return Inertia::render('fasilitas/jalan/create', [
                'desa' => $desa,
                'tipeAkses' => $tipeAkses,
                'jenisOptions' => $jenisOptions,
                'kondisiOptions' => ['baik', 'rusak_ringan', 'rusak_berat'],
            ]);
        }

        return Inertia::render('fasilitas/create', [
            'desa' => $desa,
            'tipeAkses' => $tipeAkses,
            'jenisOptions' => $jenisOptions,
            'kondisiOptions' => ['baik', 'rusak_ringan', 'rusak_berat'],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'desa_id' => 'required|exists:desa,id',
            'nama' => 'required|string|max:255',
            'jenis' => 'required|string',
            'kondisi' => 'required|in:baik,rusak_ringan,rusak_berat',
            'koordinat' => 'required|json',
            'alamat_auto' => 'nullable|string',
            'alamat_manual' => 'nullable|string',
            'rt' => 'nullable|string|max:10',
            'rw' => 'nullable|string|max:10',
            'no_telepon' => 'nullable|string|max:20',
            'jam_operasional' => 'nullable|string',
            'kapasitas' => 'nullable|integer',
            'tahun_dibangun' => 'nullable|integer|digits:4',
            'penanggung_jawab' => 'nullable|string|max:255',
            'keterangan' => 'nullable|string',
            'tipe_akses' => 'required|in:umum,privat,jalan',
            'foto' => 'nullable|image|mimes:jpeg,jpg,png|max:2048',
        ]);

        // Handle file upload
        $fotoPath = null;
        if ($request->hasFile('foto')) {
            $fotoPath = $request->file('foto')->store('fasilitas', 'public');
        }

        Fasilitas::create([
            ...$validated,
            'foto' => $fotoPath ? asset('storage/' . $fotoPath) : null,
        ]);

        return redirect()->route('fasilitas.index', ['tipe' => $validated['tipe_akses']])->with('success', 'Fasilitas berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $fasilitas = Fasilitas::with('desa')->findOrFail($id);
        
        if ($fasilitas->tipe_akses === 'jalan') {
            return Inertia::render('fasilitas/jalan/show', [
                'fasilitas' => $fasilitas,
            ]);
        }
        
        return Inertia::render('fasilitas/show', [
            'fasilitas' => $fasilitas,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id, Request $request)
    {
        $fasilitas = Fasilitas::with('desa')->findOrFail($id);
        $desa = Desa::all();
        $tipeAkses = $request->query('tipe', $fasilitas->tipe_akses); 

        $jenisOptions = [
            'sekolah_sd', 'sekolah_smp', 'sekolah_sma', 'universitas',
            'masjid', 'mushola', 'gereja', 'pura', 'vihara',
            'puskesmas', 'klinik', 'rumah_sakit_umum', 'posyandu',
            'kantor_desa_kelurahan', 'kantor_kecamatan', 'kantor_pemerintah_dinas_instansi',
            'balai_desa_pertemuan', 'pasar_tradisional', 'terminal_halte',
            'pos_polisi', 'pos_damkar', 'lapangan_taman', 'stadion_gor',
            'perpustakaan_daerah', 'tempat_pemakaman_umum_tpu', 'kantor_pos'
        ];

        if ($tipeAkses === 'jalan') {
             $jenisOptions = [
                'jalan_nasional', 'jalan_provinsi', 'jalan_kabupaten', 'jalan_desa', 'jalan_lingkungan', 'jalan_setapak'
            ];
            return Inertia::render('fasilitas/jalan/edit', [
                'fasilitas' => $fasilitas,
                'desa' => $desa,
                'tipeAkses' => $tipeAkses,
                'jenisOptions' => $jenisOptions,
                'kondisiOptions' => ['baik', 'rusak_ringan', 'rusak_berat'],
            ]);
        }

        return Inertia::render('fasilitas/edit', [
            'fasilitas' => $fasilitas,
            'desa' => $desa,
            'tipeAkses' => $tipeAkses,
            'jenisOptions' => $jenisOptions,
            'kondisiOptions' => ['baik', 'rusak_ringan', 'rusak_berat'],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'desa_id' => 'required|exists:desa,id',
            'nama' => 'required|string|max:255',
            'jenis' => 'required|string',
            'kondisi' => 'required|in:baik,rusak_ringan,rusak_berat',
            'koordinat' => 'required|json',
            'alamat_auto' => 'nullable|string',
            'alamat_manual' => 'nullable|string',
            'rt' => 'nullable|string|max:10',
            'rw' => 'nullable|string|max:10',
            'no_telepon' => 'nullable|string|max:20',
            'jam_operasional' => 'nullable|string',
            'kapasitas' => 'nullable|integer',
            'tahun_dibangun' => 'nullable|integer|digits:4',
            'penanggung_jawab' => 'nullable|string|max:255',
            'keterangan' => 'nullable|string',
            'tipe_akses' => 'required|in:umum,privat,jalan',
            'foto' => 'nullable|image|mimes:jpeg,jpg,png|max:2048',
        ]);

        $fasilitas = Fasilitas::findOrFail($id);

        // Handle file upload
        $fotoPath = $fasilitas->foto;
        if ($request->hasFile('foto')) {
            if ($fasilitas->foto) {
                $oldPath = str_replace(asset('storage/'), '', $fasilitas->foto);
                Storage::disk('public')->delete($oldPath);
            }
            $newPath = $request->file('foto')->store('fasilitas', 'public');
            $fotoPath = asset('storage/' . $newPath);
        }

        $fasilitas->update([
            ...$validated,
            'foto' => $fotoPath,
        ]);

        return redirect()->route('fasilitas.index', ['tipe' => $validated['tipe_akses']])->with('success', 'Fasilitas berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $fasilitas = Fasilitas::findOrFail($id);
        $tipeAkses = $fasilitas->tipe_akses;

        // Delete foto if exists
        if ($fasilitas->foto) {
            $path = str_replace(asset('storage/'), '', $fasilitas->foto);
            Storage::disk('public')->delete($path);
        }

        $fasilitas->delete();

        return redirect()->route('fasilitas.index', ['tipe' => $tipeAkses])->with('success', 'Fasilitas berhasil dihapus.');
    }

    /**
     * Get all facilities for API markers.
     */
    public function apiMarkers(Request $request)
    {
        $tipeAkses = $request->query('tipe');
        
        $query = Fasilitas::query();
        
        if ($tipeAkses) {
            $query->where('tipe_akses', $tipeAkses);
        }
        
        $fasilitas = $query->get();
        return response()->json($fasilitas);
    }
}