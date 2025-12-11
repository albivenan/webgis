<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PenggunaanLahan extends Model
{
    protected $table = 'penggunaan_lahan';

    protected $fillable = [
        'desa_id',
        'jenis',
        'luas',
        'polygon',
        'keterangan',
    ];

    protected $casts = [
        'luas' => 'decimal:2',
    ];

    // Relationship
    public function desa(): BelongsTo
    {
        return $this->belongsTo(Desa::class);
    }

    // Accessor for GeoJSON polygon
    public function getPolygonAttribute($value)
    {
        return json_decode($value, true);
    }

    // Mutator for GeoJSON polygon
    public function setPolygonAttribute($value)
    {
        $this->attributes['polygon'] = is_string($value) ? $value : json_encode($value);
    }
}
