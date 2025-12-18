<?php

namespace App\Http\Controllers;

use App\Models\LokasiPenting;
use App\Models\Fasilitas;
use App\Models\Bencana;
use App\Models\Rumah;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MarkerDataController extends Controller
{
    public function getLokasiPentingMarkers()
    {
        $lokasiPenting = LokasiPenting::all();
        return response()->json($lokasiPenting);
    }

    public function getFasilitasMarkers()
    {
        $fasilitas = Fasilitas::all();
        return response()->json($fasilitas);
    }

    public function getBencanaMarkers()
    {
        $bencana = Bencana::all();
        return response()->json($bencana);
    }

    public function getRumahMarkers()
    {
        $rumah = Rumah::with(['penduduk', 'kartuKeluarga.anggotaKeluarga'])->get();
        
        $rumah = $rumah->map(function($item) {
            $nama_pemilik = null;
            
            if ($item->penduduk) {
                $nama_pemilik = $item->penduduk->nama_lengkap;
            } elseif ($item->kartuKeluarga) {
                $kepalaKeluarga = $item->kartuKeluarga->anggotaKeluarga
                    ->where('status_hubungan_dalam_keluarga', 'Kepala Keluarga')
                    ->first();
                
                if ($kepalaKeluarga) {
                    $nama_pemilik = $kepalaKeluarga->nama_lengkap;
                } else {
                    $nama_pemilik = "KK: " . $item->kartuKeluarga->nomor_kk;
                }
            }
            
            $item->nama_pemilik = $nama_pemilik ?: $item->alamat;
            return $item;
        });

        return response()->json($rumah);
    }

    public function getKartuKeluargaMarkers()
    {
        $kartuKeluarga = \App\Models\KartuKeluarga::whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->get();
        return response()->json($kartuKeluarga);
    }
}
