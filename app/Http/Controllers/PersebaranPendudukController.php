<?php

namespace App\Http\Controllers;

use App\Models\PersebaranPenduduk;
use App\Models\KartuKeluarga;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PersebaranPendudukController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = PersebaranPenduduk::query();

        // Apply filters if provided
        if ($request->has('rt') && $request->rt) {
            $query->where('rt', $request->rt);
        }
        if ($request->has('rw') && $request->rw) {
            $query->where('rw', $request->rw);
        }
        if ($request->has('periode_bulan') && $request->periode_bulan) {
            $query->where('periode_bulan', $request->periode_bulan);
        }
        if ($request->has('periode_tahun') && $request->periode_tahun) {
            $query->where('periode_tahun', $request->periode_tahun);
        }

        // Get all data ordered by latest period
        $data = $query->orderBy('periode_tahun', 'desc')
            ->orderBy('periode_bulan', 'desc')
            ->orderBy('rt')
            ->orderBy('rw')
            ->get();

        // Transform data to include real KK count if stored value is 0
        $data->transform(function ($item) {
            if ($item->jumlah_kk == 0) {
                $item->jumlah_kk = KartuKeluarga::where('rt', $item->rt)
                    ->where('rw', $item->rw)
                    ->count();
            }
            return $item;
        });

        // Calculate statistics
        $statistics = [
            'total_penduduk' => $data->sum(function($item) {
                return $item->jumlah_laki_laki + $item->jumlah_perempuan;
            }),
            'total_laki_laki' => $data->sum('jumlah_laki_laki'),
            'total_perempuan' => $data->sum('jumlah_perempuan'),
            'total_kelahiran' => $data->sum('jumlah_kelahiran'),
            'total_kematian' => $data->sum('jumlah_kematian'),
            'total_kk' => $data->sum('jumlah_kk'),
        ];

        // Get unique RT/RW for filters
        $rtList = PersebaranPenduduk::distinct()->pluck('rt')->sort()->values();
        $rwList = PersebaranPenduduk::distinct()->pluck('rw')->sort()->values();
        $tahunList = PersebaranPenduduk::distinct()->pluck('periode_tahun')->sort()->values();

        return Inertia::render('data-kependudukan/persebaran-penduduk/index', [
            'data' => $data,
            'statistics' => $statistics,
            'filters' => [
                'rt' => $request->rt,
                'rw' => $request->rw,
                'periode_bulan' => $request->periode_bulan,
                'periode_tahun' => $request->periode_tahun,
            ],
            'rtList' => $rtList,
            'rwList' => $rwList,
            'tahunList' => $tahunList,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('data-kependudukan/persebaran-penduduk/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'rt' => 'required|string|max:3',
            'rw' => 'required|string|max:3',
            'periode_bulan' => 'required|integer|min:1|max:12',
            'periode_tahun' => 'required|integer|min:1900|max:2100',
            'jumlah_kk' => 'required|integer|min:0',
            'jumlah_laki_laki' => 'required|integer|min:0',
            'jumlah_perempuan' => 'required|integer|min:0',
            'jumlah_kelahiran' => 'required|integer|min:0',
            'jumlah_kematian' => 'required|integer|min:0',
            'keterangan' => 'nullable|string',
        ]);

        PersebaranPenduduk::create($validated);

        return redirect()->route('data-kependudukan.persebaran-penduduk.index')
            ->with('success', 'Data persebaran penduduk berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $data = PersebaranPenduduk::findOrFail($id);
        
        return Inertia::render('data-kependudukan/persebaran-penduduk/edit', [
            'data' => $data,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'rt' => 'required|string|max:3',
            'rw' => 'required|string|max:3',
            'periode_bulan' => 'required|integer|min:1|max:12',
            'periode_tahun' => 'required|integer|min:1900|max:2100',
            'jumlah_kk' => 'required|integer|min:0',
            'jumlah_laki_laki' => 'required|integer|min:0',
            'jumlah_perempuan' => 'required|integer|min:0',
            'jumlah_kelahiran' => 'required|integer|min:0',
            'jumlah_kematian' => 'required|integer|min:0',
            'keterangan' => 'nullable|string',
        ]);

        $data = PersebaranPenduduk::findOrFail($id);
        $data->update($validated);

        return redirect()->route('data-kependudukan.persebaran-penduduk.index')
            ->with('success', 'Data persebaran penduduk berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $data = PersebaranPenduduk::findOrFail($id);
        $data->delete();

        return redirect()->route('data-kependudukan.persebaran-penduduk.index')
            ->with('success', 'Data persebaran penduduk berhasil dihapus.');
    }

    /**
     * Get count of Kartu Keluarga for specific RT/RW
     */
    public function getKkCount(Request $request)
    {
        $rt = $request->input('rt');
        $rw = $request->input('rw');

        $count = KartuKeluarga::where('rt', $rt)
            ->where('rw', $rw)
            ->count();

        return response()->json(['count' => $count]);
    }

    /**
     * Show detail of Kartu Keluarga in specific RT/RW
     */
    public function detailKk(Request $request, string $rt, string $rw)
    {
        $kartuKeluarga = KartuKeluarga::where('rt', $rt)
            ->where('rw', $rw)
            ->with(['anggotaKeluarga' => function($query) {
                $query->where('status_hubungan_dalam_keluarga', 'Kepala Keluarga');
            }])
            ->get();

        return Inertia::render('data-kependudukan/persebaran-penduduk/detail-kk', [
            'kartuKeluarga' => $kartuKeluarga,
            'rt' => $rt,
            'rw' => $rw,
        ]);
    }
}

