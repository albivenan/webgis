<?php

use App\Http\Controllers\DataKependudukanController;
use App\Http\Controllers\KartuKeluargaController;
use App\Http\Controllers\RumahController;
use App\Http\Controllers\BencanaController;
use App\Http\Controllers\PersebaranPendudukController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');


Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard dengan statistik
    Route::get('dashboard', [App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

    // Peta Interaktif
    Route::get('peta-interaktif', [App\Http\Controllers\PetaController::class, 'index'])->name('peta.interaktif');

    // Manajemen Data - New pages
    Route::get('manajemen-data/kemacetan', function () {
        return Inertia::render('manajemen-data/kemacetan');
    })->name('manajemen-data.kemacetan');
    
    Route::get('manajemen-data/kecelakaan', function () {
        return Inertia::render('manajemen-data/kecelakaan');
    })->name('manajemen-data.kecelakaan');
    
    Route::get('manajemen-data/wilayah-rawan', function () {
        return Inertia::render('manajemen-data/wilayah-rawan');
    })->name('manajemen-data.wilayah-rawan');
    
    Route::get('manajemen-data/lokasi', function () {
        return Inertia::render('manajemen-data/lokasi');
    })->name('manajemen-data.lokasi');

    Route::get('manajemen-data/penduduk', function () {
        return Inertia::render('manajemen-data/penduduk'); // Placeholder
    })->name('manajemen-data.penduduk');

    Route::get('/data-kependudukan/lokasi-penduduk', [DataKependudukanController::class, 'lokasiPenduduk'])->name('data-kependudukan.lokasi-penduduk');
    Route::get('/data-kependudukan/lokasi-penduduk/create', [DataKependudukanController::class, 'create'])->name('data-kependudukan.lokasi-penduduk.create');
    Route::post('/data-kependudukan/lokasi-penduduk', [DataKependudukanController::class, 'store'])->name('data-kependudukan.lokasi-penduduk.store');
    Route::get('/data-kependudukan/lokasi-penduduk/{rumah}', [DataKependudukanController::class, 'showRumah'])->name('data-kependudukan.lokasi-penduduk.show');
    Route::get('/data-kependudukan/lokasi-penduduk/{rumah}/edit', [DataKependudukanController::class, 'editRumah'])->name('data-kependudukan.lokasi-penduduk.edit');
    Route::put('/data-kependudukan/lokasi-penduduk/{rumah}', [DataKependudukanController::class, 'updateRumah'])->name('data-kependudukan.lokasi-penduduk.update');
    Route::delete('/data-kependudukan/lokasi-penduduk/{rumah}', [DataKependudukanController::class, 'destroyRumah'])->name('data-kependudukan.lokasi-penduduk.destroy');
    Route::put('/data-kependudukan/lokasi-penduduk/{id}/location', [DataKependudukanController::class, 'updateLocation'])->name('data-kependudukan.lokasi-penduduk.update-location');

    // Kartu Keluarga
    Route::resource('data-kependudukan/kartu-keluarga', KartuKeluargaController::class)->names([
        'index' => 'data-kependudukan.kartu-keluarga.index',
        'create' => 'data-kependudukan.kartu-keluarga.create',
        'store' => 'data-kependudukan.kartu-keluarga.store',
        'show' => 'data-kependudukan.kartu-keluarga.show',
        'edit' => 'data-kependudukan.kartu-keluarga.edit',
        'update' => 'data-kependudukan.kartu-keluarga.update',
        'destroy' => 'data-kependudukan.kartu-keluarga.destroy',
    ]);
    Route::get('api/penduduk/search', [KartuKeluargaController::class, 'search'])->name('api.penduduk.search');
    Route::put('data-kependudukan/kartu-keluarga/{kartuKeluarga}/update-location', [KartuKeluargaController::class, 'updateLocation'])->name('data-kependudukan.kartu-keluarga.update-location');

    // Rumah (House) Routes - Separate from KK
    Route::get('/data-kependudukan/rumah', [RumahController::class, 'index'])->name('data-kependudukan.rumah.index');
    Route::get('/data-kependudukan/rumah/create', [RumahController::class, 'create'])->name('data-kependudukan.rumah.create');
    Route::post('/data-kependudukan/rumah', [RumahController::class, 'store'])->name('data-kependudukan.rumah.store');
    Route::get('/data-kependudukan/rumah/{rumah}', [RumahController::class, 'show'])->name('data-kependudukan.rumah.show');
    Route::get('/data-kependudukan/rumah/{rumah}/edit', [RumahController::class, 'edit'])->name('data-kependudukan.rumah.edit');
    Route::put('/data-kependudukan/rumah/{rumah}', [RumahController::class, 'update'])->name('data-kependudukan.rumah.update');
    Route::delete('/data-kependudukan/rumah/{rumah}', [RumahController::class, 'destroy'])->name('data-kependudukan.rumah.destroy');
    Route::get('/api/rumah/kartu-keluarga/{id}', [RumahController::class, 'getByKartuKeluarga'])->name('api.rumah.by-kk');

    // Persebaran Penduduk
    Route::resource('data-kependudukan/persebaran-penduduk', App\Http\Controllers\PersebaranPendudukController::class)->names([
        'index' => 'data-kependudukan.persebaran-penduduk.index',
        'create' => 'data-kependudukan.persebaran-penduduk.create',
        'store' => 'data-kependudukan.persebaran-penduduk.store',
        'edit' => 'data-kependudukan.persebaran-penduduk.edit',
        'update' => 'data-kependudukan.persebaran-penduduk.update',
        'destroy' => 'data-kependudukan.persebaran-penduduk.destroy',
    ]);
    Route::get('api/persebaran-penduduk/get-kk-count', [App\Http\Controllers\PersebaranPendudukController::class, 'getKkCount'])->name('api.persebaran-penduduk.get-kk-count');
    Route::get('data-kependudukan/persebaran-penduduk/detail-kk/{rt}/{rw}', [App\Http\Controllers\PersebaranPendudukController::class, 'detailKk'])->name('data-kependudukan.persebaran-penduduk.detail-kk');

    // Batas Wilayah
    Route::get('/batas-wilayah', [App\Http\Controllers\BatasWilayahController::class, 'index'])->name('batas-wilayah.index');
    Route::get('/batas-wilayah/create', [App\Http\Controllers\BatasWilayahController::class, 'create'])->name('batas-wilayah.create');
    Route::post('/batas-wilayah', [App\Http\Controllers\BatasWilayahController::class, 'store'])->name('batas-wilayah.store');
    Route::get('/batas-wilayah/{id}', [App\Http\Controllers\BatasWilayahController::class, 'show'])->name('batas-wilayah.show');
    Route::get('/batas-wilayah/{id}/edit', [App\Http\Controllers\BatasWilayahController::class, 'edit'])->name('batas-wilayah.edit');
    Route::put('/batas-wilayah/{id}', [App\Http\Controllers\BatasWilayahController::class, 'update'])->name('batas-wilayah.update');
    Route::delete('/batas-wilayah/{id}', [App\Http\Controllers\BatasWilayahController::class, 'destroy'])->name('batas-wilayah.destroy');

    // Fasilitas (Umum & Privat)
    Route::resource('fasilitas', App\Http\Controllers\FasilitasController::class);

    // Bencana Alam
    Route::get('/bencana/berlangsung', [BencanaController::class, 'berlangsung'])->name('bencana.berlangsung');
    Route::get('/bencana/riwayat', [BencanaController::class, 'riwayat'])->name('bencana.riwayat');
    Route::get('/bencana/create', [BencanaController::class, 'create'])->name('bencana.create');
    Route::post('/bencana', [BencanaController::class, 'store'])->name('bencana.store');
    Route::get('/bencana/{bencana}', [BencanaController::class, 'show'])->name('bencana.show');
    Route::get('/bencana/{bencana}/edit', [BencanaController::class, 'edit'])->name('bencana.edit');
    Route::put('/bencana/{bencana}', [BencanaController::class, 'update'])->name('bencana.update');
    Route::delete('/bencana/{bencana}', [BencanaController::class, 'destroy'])->name('bencana.destroy');
    Route::post('/bencana/{bencana}/selesaikan', [BencanaController::class, 'selesaikan'])->name('bencana.selesaikan');



    // API untuk data marker
    Route::prefix('api/markers')->group(function () {
        Route::get('lokasi-penting', [App\Http\Controllers\MarkerDataController::class, 'getLokasiPentingMarkers'])->name('api.markers.lokasi-penting');
        Route::get('fasilitas', [App\Http\Controllers\FasilitasController::class, 'apiMarkers'])->name('api.markers.fasilitas');
        Route::get('bencana', [App\Http\Controllers\BencanaController::class, 'apiMarkers'])->name('api.markers.bencana');
        Route::get('rumah', [App\Http\Controllers\MarkerDataController::class, 'getRumahMarkers'])->name('api.markers.rumah');
        Route::get('batas-wilayah', [App\Http\Controllers\BatasWilayahController::class, 'apiMarkers'])->name('api.markers.batas-wilayah');
        Route::get('kartu-keluarga', [App\Http\Controllers\MarkerDataController::class, 'getKartuKeluargaMarkers'])->name('api.markers.kartu-keluarga');
    });

});

// API untuk data marker (dipindahkan ke luar middleware auth)
Route::prefix('api/markers')->group(function () {
    Route::get('lokasi-penting', [App\Http\Controllers\MarkerDataController::class, 'getLokasiPentingMarkers'])->name('api.markers.lokasi-penting');
    Route::get('fasilitas', [App\Http\Controllers\FasilitasController::class, 'apiMarkers'])->name('api.markers.fasilitas');
    Route::get('bencana', [App\Http\Controllers\BencanaController::class, 'apiMarkers'])->name('api.markers.bencana');
    Route::get('rumah', [App\Http\Controllers\MarkerDataController::class, 'getRumahMarkers'])->name('api.markers.rumah');
    Route::get('batas-wilayah', [App\Http\Controllers\BatasWilayahController::class, 'apiMarkers'])->name('api.markers.batas-wilayah');
    Route::get('kartu-keluarga', [App\Http\Controllers\MarkerDataController::class, 'getKartuKeluargaMarkers'])->name('api.markers.kartu-keluarga');
});

require __DIR__.'/settings.php';
