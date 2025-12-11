<?php

namespace App\Http\Controllers;

use App\Models\Desa;
use App\Models\LokasiPenting;
use App\Models\Infrastruktur;
use App\Models\PenggunaanLahan;
use Inertia\Inertia;
use Inertia\Response;

class PetaController extends Controller
{
    public function index(): Response
    {
        // For now, we'll pass empty arrays for old data and add mock events
        // In the future, these will come from the database
        
        return Inertia::render('peta-interaktif', [
            'desa' => null, // Will be populated when we have village boundaries
            'lokasiPenting' => [],
            'infrastruktur' => [],
            'penggunaanLahan' => [],
            // Mock data will be loaded directly in the frontend for now
        ]);
    }
}
