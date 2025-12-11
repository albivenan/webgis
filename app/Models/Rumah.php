<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Rumah extends Model
{
    use HasFactory;

    protected $table = 'rumah';

    protected $fillable = [
        'kartu_keluarga_id',
        'penduduk_id',
        'alamat',
        'rt',
        'rw',
        'latitude',
        'longitude',
        'keterangan',
        'foto_rumah',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    /**
     * Get the Kartu Keluarga that owns this house
     */
    public function kartuKeluarga()
    {
        return $this->belongsTo(KartuKeluarga::class);
    }

    /**
     * Get the Penduduk that owns this house (for non-KK residents)
     */
    public function penduduk()
    {
        return $this->belongsTo(Penduduk::class);
    }
}
