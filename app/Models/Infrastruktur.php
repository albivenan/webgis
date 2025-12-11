<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Infrastruktur extends Model
{
    protected $table = 'infrastruktur';

    protected $fillable = [
        'desa_id',
        'nama',
        'jenis',
        'kondisi',
        'panjang',
        'koordinat',
        'keterangan',
    ];

    protected $casts = [
        'panjang' => 'decimal:2',
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
