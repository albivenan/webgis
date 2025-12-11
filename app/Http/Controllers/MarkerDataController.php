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
        $rumah = Rumah::all();
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
