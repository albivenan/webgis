<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class KartuKeluarga extends Model
{
    use HasFactory;

    protected $fillable = [
        'nomor_kk',
        'alamat',
        'rt',
        'rw',
        'kode_pos',
        'desa_kelurahan',
        'kecamatan',
        'kabupaten_kota',
        'provinsi',
        'latitude',
        'longitude',
        'foto_rumah',
    ];

    public function anggotaKeluarga()
    {
        return $this->hasMany(Penduduk::class);
    }

    public function rumah()
    {
        return $this->hasMany(Rumah::class);
    }
}
