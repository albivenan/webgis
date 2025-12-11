<?php

namespace App\Http\Controllers;

use App\Models\Desa;
use App\Models\LokasiPenting;
use App\Models\Infrastruktur;
use App\Models\Bencana;
use App\Models\Penduduk;
use App\Models\KartuKeluarga;
use App\Models\Fasilitas;
use App\Models\BatasWilayah;
use App\Models\User;
use App\Models\PenggunaanLahan;
use Inertia\Inertia;
use Inertia\Response;


class DashboardController extends Controller
{
    public function index(): Response
    {
        $desa = Desa::first();
        
        $stats = [
            'users' => [
                'total' => User::count()
            ],
            'kependudukan' => [
                'total_kk' => KartuKeluarga::count(),
                'total_penduduk' => Penduduk::count(),
            ],
            'fasilitas' => [
                'total' => Fasilitas::count(),
                'umum' => Fasilitas::where('jenis', 'umum')->count(),
                'privat' => Fasilitas::where('jenis', 'privat')->count(),
            ],
            'batas_wilayah' => [
                'total' => BatasWilayah::count()
            ],
            'bencana' => [
                'total' => Bencana::count(),
                'berlangsung' => Bencana::berlangsung()->count(),
                'selesai' => Bencana::selesai()->count(),
            ],
            'lokasi_penting' => [
                'total' => LokasiPenting::count()
            ],
        ];

        // Group lokasi penting by kategori
        $lokasiByKategori = LokasiPenting::selectRaw('kategori, count(*) as total')
            ->groupBy('kategori')
            ->get()
            ->mapWithKeys(fn($item) => [$item->kategori => $item->total]);

        // Group infrastruktur by kondisi
        $infrastrukturByKondisi = Infrastruktur::selectRaw('kondisi, count(*) as total')
            ->groupBy('kondisi')
            ->get()
            ->mapWithKeys(fn($item) => [$item->kondisi => $item->total]);

        // Group penggunaan lahan by jenis with luas
        $penggunaanLahanByJenis = PenggunaanLahan::selectRaw('jenis, sum(luas) as total_luas')
            ->groupBy('jenis')
            ->get()
            ->mapWithKeys(fn($item) => [$item->jenis => $item->total_luas]);

        $recentBencana = Bencana::latest()->take(5)->get()->map(function ($bencana) {
            $bencana->tanggal = $bencana->tanggal_mulai; // Map tanggal_mulai to tanggal for frontend
            return $bencana;
        });

        $fasilitasByType = Fasilitas::selectRaw('jenis, count(*) as total')
            ->groupBy('jenis')
            ->get()
            ->mapWithKeys(fn($item) => [$item->jenis => $item->total]);

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'lokasiByKategori' => $lokasiByKategori,
            'infrastrukturByKondisi' => $infrastrukturByKondisi,
            'penggunaanLahanByJenis' => $penggunaanLahanByJenis,
            'desa' => $desa,
            'recentBencana' => $recentBencana,
            'fasilitasByType' => $fasilitasByType,
        ]);
    }
}
