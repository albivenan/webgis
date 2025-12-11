<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FasilitasUmum extends Model
{
    use HasFactory;

    protected $table = 'fasilitas_umum';

    protected $fillable = [
        'nama',
        'jenis',
        'latitude',
        'longitude',
        'alamat',
        'keterangan',
        'foto',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];
}
