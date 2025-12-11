<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MapEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_type',
        'level',
        'hazard_type',
        'title',
        'description',
        'latitude',
        'longitude',
        'radius',
        'polyline',
        'polygon',
        'image_path',
    ];

    protected $casts = [
        'polyline' => 'array',
        'polygon' => 'array',
        'latitude' => 'float',
        'longitude' => 'float',
        'radius' => 'integer',
    ];

    public function scopeByType($query, $type)
    {
        return $query->where('event_type', $type);
    }
}
