<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Desa extends Model
{
    protected $table = 'desa';

    protected $fillable = [
        'nama_desa',
        'kode_desa',
        'kecamatan',
        'kabupaten',
        'provinsi',
        'luas_wilayah',
        'jumlah_penduduk',
        'batas_wilayah',
    ];

    protected $casts = [
        'luas_wilayah' => 'decimal:2',
        'jumlah_penduduk' => 'integer',
    ];

    // Relationships
    public function lokasiPenting(): HasMany
    {
        return $this->hasMany(LokasiPenting::class);
    }

    public function infrastruktur(): HasMany
    {
        return $this->hasMany(Infrastruktur::class);
    }

    public function penggunaanLahan(): HasMany
    {
        return $this->hasMany(PenggunaanLahan::class);
    }

    // Accessor for GeoJSON boundary
    public function getBatasWilayahAttribute($value)
    {
        return json_decode($value, true);
    }

    // Mutator for GeoJSON boundary
    public function setBatasWilayahAttribute($value)
    {
        $this->attributes['batas_wilayah'] = is_string($value) ? $value : json_encode($value);
    }
}
