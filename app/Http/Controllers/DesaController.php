<?php

namespace App\Http\Controllers;

use App\Models\Desa;
use Inertia\Inertia;
use Inertia\Response;

class DesaController extends Controller
{
    public function show(): Response
    {
        $desa = Desa::first();

        return Inertia::render('informasi-desa', [
            'desa' => $desa,
        ]);
    }
}
