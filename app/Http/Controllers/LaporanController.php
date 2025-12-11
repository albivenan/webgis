<?php

namespace App\Http\Controllers;

use App\Models\LokasiPenting;
use App\Models\Infrastruktur;
use App\Models\PenggunaanLahan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LaporanController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('laporan', [
            'stats' => [
                'lokasi' => LokasiPenting::count(),
                'infrastruktur' => Infrastruktur::count(),
                'lahan' => PenggunaanLahan::count(),
            ]
        ]);
    }

    public function exportLokasi()
    {
        $data = LokasiPenting::all();
        $csvFileName = 'lokasi_penting_' . date('Y-m-d_H-i-s') . '.csv';
        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$csvFileName",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $handle = fopen('php://output', 'w');
        ob_start();
        fputcsv($handle, ['ID', 'Nama', 'Kategori', 'Latitude', 'Longitude', 'Deskripsi']);
        
        foreach ($data as $row) {
            fputcsv($handle, [
                $row->id,
                $row->nama,
                $row->kategori,
                $row->latitude,
                $row->longitude,
                $row->deskripsi
            ]);
        }
        
        fclose($handle);
        return response(ob_get_clean(), 200, $headers);
    }
}
