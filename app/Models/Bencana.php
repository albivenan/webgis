<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bencana extends Model
{
    use HasFactory;

    protected $table = 'bencana';

    protected $fillable = [
        'nama_bencana',
        'jenis_bencana',
        'tingkat_bahaya',
        'tipe_lokasi',
        'lokasi_data',
        'luas',
        'warna_penanda',
        'tanggal_mulai',
        'tanggal_selesai',
        'status',
        'korban_jiwa',
        'korban_luka',
        'kerusakan_infrastruktur',
        'keterangan',
        'foto',
    ];

    protected $casts = [
        'lokasi_data' => 'array', 'luas' => 'decimal:2', 'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date', 'korban_jiwa' => 'integer', 'korban_luka' => 'integer',
    ];

    public function scopeBerlangsung($query)
    {
        return $query->where('status', 'berlangsung');
    }

    public function scopeSelesai($query)
    {
        return $query->where('status', 'selesai');
    }

    /**
     * Calculate area from polygon coordinates or radius
     */
    public static function calculateArea(string $tipe_lokasi, array $lokasi_data): float
    {
        if ($tipe_lokasi === 'titik') {
            return 0; // Points have no area
        }

        if ($tipe_lokasi === 'radius') {
            // Circle area = π * r²
            $radius = $lokasi_data['radius'] ?? 0;
            return pi() * $radius * $radius;
        }

        if ($tipe_lokasi === 'polygon' && is_array($lokasi_data)) {
            // Use same Shoelace formula as BatasWilayah
            if (count($lokasi_data) < 3) {
                return 0;
            }

            $area = 0;
            $n = count($lokasi_data);
            
            for ($i = 0; $i < $n; $i++) {
                $j = ($i + 1) % $n;
                $area += $lokasi_data[$i][0] * $lokasi_data[$j][1];
                $area -= $lokasi_data[$j][0] * $lokasi_data[$i][1];
            }
            
            $area = abs($area) / 2;
            
            // Convert to meters
            $metersPerDegreeLat = 111320;
            $metersPerDegreeLng = 111320 * 0.991;
            
            return $area * $metersPerDegreeLat * $metersPerDegreeLng;
        }

        return 0;
    }

    /**
     * Format area for display
     */
    public function getFormattedLuasAttribute(): string
    {
        if (!$this->luas || $this->tipe_lokasi === 'titik') {
            return '-';
        }

        if ($this->luas >= 10000) {
            $hectares = $this->luas / 10000;
            return number_format($hectares, 2, ',', '.') . ' ha';
        }

        return number_format($this->luas, 0, ',', '.') . ' m²';
    }

    /**
     * Boot method to auto-calculate area
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($model) {
            if ($model->lokasi_data && is_array($model->lokasi_data)) {
                $model->luas = self::calculateArea($model->tipe_lokasi, $model->lokasi_data);
            }
        });
    }
}
