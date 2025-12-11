<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PersebaranPenduduk extends Model
{
    protected $table = 'persebaran_penduduk';
    
    protected $fillable = [
        'rt',
        'rw',
        'periode_bulan',
        'periode_tahun',
        'jumlah_kk',
        'jumlah_laki_laki',
        'jumlah_perempuan',
        'jumlah_kelahiran',
        'jumlah_kematian',
        'keterangan',
    ];

    protected $casts = [
        'periode_bulan' => 'integer',
        'periode_tahun' => 'integer',
        'jumlah_kk' => 'integer',
        'jumlah_laki_laki' => 'integer',
        'jumlah_perempuan' => 'integer',
        'jumlah_kelahiran' => 'integer',
        'jumlah_kematian' => 'integer',
    ];

    protected $appends = [
        'jumlah_total',
        'bulan_name',
    ];

    // Accessor for total population
    public function getJumlahTotalAttribute()
    {
        return $this->jumlah_laki_laki + $this->jumlah_perempuan;
    }

    // Scope for filtering by RT/RW
    public function scopeByRtRw($query, $rt = null, $rw = null)
    {
        if ($rt) {
            $query->where('rt', $rt);
        }
        if ($rw) {
            $query->where('rw', $rw);
        }
        return $query;
    }

    // Scope for filtering by period
    public function scopeByPeriod($query, $bulan = null, $tahun = null)
    {
        if ($bulan) {
            $query->where('periode_bulan', $bulan);
        }
        if ($tahun) {
            $query->where('periode_tahun', $tahun);
        }
        return $query;
    }

    // Get month name in Indonesian
    public function getBulanNameAttribute()
    {
        $months = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];
        return $months[$this->periode_bulan] ?? '';
    }
}
