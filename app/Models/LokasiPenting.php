<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LokasiPenting extends Model
{
    protected $table = 'lokasi_penting';

    protected $fillable = [
        'desa_id',
        'nama',
        'kategori',
        'latitude',
        'longitude',
        'deskripsi',
        'foto',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    // Relationship
    public function desa(): BelongsTo
    {
        return $this->belongsTo(Desa::class);
    }
}
