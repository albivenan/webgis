<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Fasilitas extends Model
{
    protected $table = 'fasilitas';

    protected $fillable = [
        'desa_id',
        'nama',
        'jenis',
        'kondisi',
        'koordinat',
        'alamat_auto',
        'alamat_manual',
        'rt',
        'rw',
        'no_telepon',
        'jam_operasional',
        'kapasitas',
        'tahun_dibangun',
        'penanggung_jawab',
        'keterangan',
        'tipe_akses',
        'foto',
    ];

    // Relationship
    public function desa(): BelongsTo
    {
        return $this->belongsTo(Desa::class);
    }

    // Accessor for GeoJSON coordinates
    public function getKoordinatAttribute($value)
    {
        return json_decode($value, true);
    }

    // Mutator for GeoJSON coordinates
    public function setKoordinatAttribute($value)
    {
        $this->attributes['koordinat'] = is_string($value) ? $value : json_encode($value);
    }
}