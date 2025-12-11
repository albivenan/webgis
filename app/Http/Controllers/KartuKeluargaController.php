<?php

namespace App\Http\Controllers;

use App\Models\KartuKeluarga;
use App\Models\Penduduk;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class KartuKeluargaController extends Controller
{
    public function index()
    {
        $kartuKeluarga = KartuKeluarga::with('anggotaKeluarga')
            ->withCount('anggotaKeluarga')
            ->paginate(10);
            
        return Inertia::render('data-kependudukan/kartu-keluarga/index', [
            'kartuKeluarga' => $kartuKeluarga
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nomor_kk' => 'required|unique:kartu_keluargas,nomor_kk',
            'alamat' => 'required',
            'rt' => 'required',
            'rw' => 'required',
            'kode_pos' => 'required',
            'desa_kelurahan' => 'required',
            'kecamatan' => 'required',
            'kabupaten_kota' => 'required',
            'provinsi' => 'required',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'foto_rumah' => 'nullable|image|mimes:jpeg,jpg,png|max:2048',
            'anggota_keluarga' => 'nullable|array',
            'anggota_keluarga.*.nik' => 'required',
            'anggota_keluarga.*.nama_lengkap' => 'required',
            'anggota_keluarga.*.jenis_kelamin' => 'required',
            'anggota_keluarga.*.tempat_lahir' => 'nullable',
            'anggota_keluarga.*.tanggal_lahir' => 'nullable|date',
            'anggota_keluarga.*.status_perkawinan' => 'nullable',
            'anggota_keluarga.*.pekerjaan' => 'nullable',
            'anggota_keluarga.*.status_hubungan_dalam_keluarga' => 'required',
            'anggota_keluarga.*.keterangan' => 'nullable',
        ]);

        // Handle file upload
        $fotoPath = null;
        if ($request->hasFile('foto_rumah')) {
            $fotoPath = $request->file('foto_rumah')->store('kartu-keluarga', 'public');
        }

        // Create Kartu Keluarga
        $kartuKeluarga = KartuKeluarga::create([
            'nomor_kk' => $validated['nomor_kk'],
            'alamat' => $validated['alamat'],
            'rt' => $validated['rt'],
            'rw' => $validated['rw'],
            'kode_pos' => $validated['kode_pos'],
            'desa_kelurahan' => $validated['desa_kelurahan'],
            'kecamatan' => $validated['kecamatan'],
            'kabupaten_kota' => $validated['kabupaten_kota'],
            'provinsi' => $validated['provinsi'],
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'foto_rumah' => $fotoPath ? asset('storage/' . $fotoPath) : null,
        ]);

        // Create Anggota Keluarga if provided
        if (isset($validated['anggota_keluarga']) && is_array($validated['anggota_keluarga'])) {
            foreach ($validated['anggota_keluarga'] as $anggota) {
                Penduduk::create([
                    'kartu_keluarga_id' => $kartuKeluarga->id,
                    'nik' => $anggota['nik'],
                    'nama_lengkap' => $anggota['nama_lengkap'],
                    'jenis_kelamin' => $anggota['jenis_kelamin'],
                    'tempat_lahir' => $anggota['tempat_lahir'] ?? null,
                    'tanggal_lahir' => $anggota['tanggal_lahir'] ?? null,
                    'status_perkawinan' => $anggota['status_perkawinan'] ?? null,
                    'pekerjaan' => $anggota['pekerjaan'] ?? null,
                    'status_hubungan_dalam_keluarga' => $anggota['status_hubungan_dalam_keluarga'],
                    'keterangan' => $anggota['keterangan'] ?? null,
                    'alamat' => $validated['alamat'], // Use KK address
                    'rt' => $validated['rt'],
                    'rw' => $validated['rw'],
                ]);
            }
        }

        return redirect()->route('data-kependudukan.kartu-keluarga.index')->with('success', 'Kartu Keluarga berhasil ditambahkan.');
    }

    public function create()
    {
        return Inertia::render('data-kependudukan/kartu-keluarga/create');
    }

    public function edit(KartuKeluarga $kartuKeluarga)
    {
        $kartuKeluarga->load('anggotaKeluarga');
        
        return Inertia::render('data-kependudukan/kartu-keluarga/edit', [
            'kartuKeluarga' => $kartuKeluarga
        ]);
    }

    public function show(KartuKeluarga $kartuKeluarga)
    {
        $kartuKeluarga->load('anggotaKeluarga');
        
        return Inertia::render('data-kependudukan/kartu-keluarga/show', [
            'kartuKeluarga' => $kartuKeluarga
        ]);
    }

    public function update(Request $request, KartuKeluarga $kartuKeluarga)
    {
        $validated = $request->validate([
            'nomor_kk' => 'required|unique:kartu_keluargas,nomor_kk,' . $kartuKeluarga->id,
            'alamat' => 'required',
            'rt' => 'required',
            'rw' => 'required',
            'kode_pos' => 'required',
            'desa_kelurahan' => 'required',
            'kecamatan' => 'required',
            'kabupaten_kota' => 'required',
            'provinsi' => 'required',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'foto_rumah' => 'nullable|image|mimes:jpeg,jpg,png|max:2048',
            'anggota_keluarga' => 'nullable|array',
            'anggota_keluarga.*.nik' => 'required',
            'anggota_keluarga.*.nama_lengkap' => 'required',
            'anggota_keluarga.*.jenis_kelamin' => 'required',
            'anggota_keluarga.*.tempat_lahir' => 'nullable',
            'anggota_keluarga.*.tanggal_lahir' => 'nullable|date',
            'anggota_keluarga.*.status_perkawinan' => 'nullable',
            'anggota_keluarga.*.pekerjaan' => 'nullable',
            'anggota_keluarga.*.status_hubungan_dalam_keluarga' => 'required',
            'anggota_keluarga.*.keterangan' => 'nullable',
        ]);

        // Handle file upload
        $fotoPath = $kartuKeluarga->foto_rumah;
        if ($request->hasFile('foto_rumah')) {
            // Delete old file if exists
            if ($kartuKeluarga->foto_rumah) {
                $oldPath = str_replace(asset('storage/'), '', $kartuKeluarga->foto_rumah);
                Storage::disk('public')->delete($oldPath);
            }
            $newPath = $request->file('foto_rumah')->store('kartu-keluarga', 'public');
            $fotoPath = asset('storage/' . $newPath);
        }

        // Update Kartu Keluarga
        $kartuKeluarga->update([
            'nomor_kk' => $validated['nomor_kk'],
            'alamat' => $validated['alamat'],
            'rt' => $validated['rt'],
            'rw' => $validated['rw'],
            'kode_pos' => $validated['kode_pos'],
            'desa_kelurahan' => $validated['desa_kelurahan'],
            'kecamatan' => $validated['kecamatan'],
            'kabupaten_kota' => $validated['kabupaten_kota'],
            'provinsi' => $validated['provinsi'],
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'foto_rumah' => $fotoPath,
        ]);

        // Delete existing family members and create new ones
        $kartuKeluarga->anggotaKeluarga()->delete();
        
        if (isset($validated['anggota_keluarga']) && is_array($validated['anggota_keluarga'])) {
            foreach ($validated['anggota_keluarga'] as $anggota) {
                Penduduk::create([
                    'kartu_keluarga_id' => $kartuKeluarga->id,
                    'nik' => $anggota['nik'],
                    'nama_lengkap' => $anggota['nama_lengkap'],
                    'jenis_kelamin' => $anggota['jenis_kelamin'],
                    'tempat_lahir' => $anggota['tempat_lahir'] ?? null,
                    'tanggal_lahir' => $anggota['tanggal_lahir'] ?? null,
                    'status_perkawinan' => $anggota['status_perkawinan'] ?? null,
                    'pekerjaan' => $anggota['pekerjaan'] ?? null,
                    'status_hubungan_dalam_keluarga' => $anggota['status_hubungan_dalam_keluarga'],
                    'keterangan' => $anggota['keterangan'] ?? null,
                    'alamat' => $validated['alamat'],
                    'rt' => $validated['rt'],
                    'rw' => $validated['rw'],
                ]);
            }
        }

        return redirect()->route('data-kependudukan.kartu-keluarga.index')->with('success', 'Kartu Keluarga berhasil diperbarui.');
    }

    public function destroy(KartuKeluarga $kartuKeluarga)
    {
        // Delete foto if exists
        if ($kartuKeluarga->foto_rumah) {
            $path = str_replace(asset('storage/'), '', $kartuKeluarga->foto_rumah);
            Storage::disk('public')->delete($path);
        }
        
        $kartuKeluarga->delete();
        return redirect()->back()->with('success', 'Kartu Keluarga berhasil dihapus.');
    }

    public function updateLocation(Request $request, KartuKeluarga $kartuKeluarga)
    {
        $validated = $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        $kartuKeluarga->update([
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
        ]);

        return redirect()->back()->with('success', 'Lokasi berhasil diperbarui.');
    }

    public function search(Request $request)
    {
        $query = $request->input('query');
        
        $penduduk = Penduduk::where('nama_lengkap', 'like', "%{$query}%")
            ->whereNotNull('kartu_keluarga_id') // Only those in a KK
            ->with('kartuKeluarga')
            ->limit(10)
            ->get();

        return response()->json($penduduk);
    }
}
