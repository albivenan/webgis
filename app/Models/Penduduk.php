<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Penduduk extends Model
{
    use HasFactory;

    protected $table = 'penduduk';

    protected $fillable = [
        'nik',
        'nama_lengkap',
        'jenis_kelamin',
        'tempat_lahir',
        'tanggal_lahir',
        'alamat',
        'rt',
        'rw',
        'status_perkawinan',
        'pekerjaan',
        'latitude',
        'longitude',
        'foto_rumah',
        'kartu_keluarga_id',
        'status_hubungan_dalam_keluarga',
        'keterangan',
    ];

    public function kartuKeluarga()
    {
        return $this->belongsTo(KartuKeluarga::class);
    }

    protected $casts = [
        'tanggal_lahir' => 'date',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];
}
