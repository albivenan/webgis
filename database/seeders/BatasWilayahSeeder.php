<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BatasWilayahSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Koordinat boundary Desa Somagede (approximate)
        // Center: [-7.5360639, 110.3850326]
        // Foto dari Unsplash (free license)
        
        $batasWilayahData = [
            [
                'nama' => 'Lahan Pertanian Utara',
                'jenis' => 'Pertanian',
                'coordinates' => json_encode([
                    [-7.530, 110.380],
                    [-7.530, 110.390],
                    [-7.535, 110.390],
                    [-7.535, 110.380],
                ]),
                'warna' => '#84cc16',
                'opacity' => 0.5,
                'nama_pemilik' => 'Bapak Suryanto',
                'no_hp_pemilik' => '081234567890',
                'alamat_pemilik' => 'Jl. Pertanian No. 1, Desa Somagede',
                'keterangan' => 'Lahan pertanian padi sawah',
                'foto' => 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama' => 'Pemukiman Penduduk Timur',
                'jenis' => 'Pemukiman',
                'coordinates' => json_encode([
                    [-7.535, 110.385],
                    [-7.535, 110.395],
                    [-7.540, 110.395],
                    [-7.540, 110.385],
                ]),
                'warna' => '#f59e0b',
                'opacity' => 0.5,
                'nama_pemilik' => 'Pemerintah Desa',
                'no_hp_pemilik' => '081234567891',
                'alamat_pemilik' => 'Kantor Desa Somagede',
                'keterangan' => 'Area pemukiman penduduk',
                'foto' => 'https://images.unsplash.com/photo-1570129477492-45a003537e1f?w=800&q=80',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama' => 'Hutan Lindung Barat',
                'jenis' => 'Hutan',
                'coordinates' => json_encode([
                    [-7.540, 110.375],
                    [-7.540, 110.385],
                    [-7.545, 110.385],
                    [-7.545, 110.375],
                ]),
                'warna' => '#15803d',
                'opacity' => 0.5,
                'nama_pemilik' => 'Kementerian Lingkungan',
                'no_hp_pemilik' => '081234567892',
                'alamat_pemilik' => 'Jl. Hutan No. 1',
                'keterangan' => 'Hutan lindung untuk konservasi',
                'foto' => 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama' => 'Perkebunan Kelapa Selatan',
                'jenis' => 'Perkebunan',
                'coordinates' => json_encode([
                    [-7.545, 110.380],
                    [-7.545, 110.390],
                    [-7.550, 110.390],
                    [-7.550, 110.380],
                ]),
                'warna' => '#22c55e',
                'opacity' => 0.5,
                'nama_pemilik' => 'Bapak Hartono',
                'no_hp_pemilik' => '081234567893',
                'alamat_pemilik' => 'Jl. Perkebunan No. 5',
                'keterangan' => 'Perkebunan kelapa sawit',
                'foto' => 'https://images.unsplash.com/photo-1625246333195-78d9c38ad576?w=800&q=80',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama' => 'Fasilitas Umum Pusat',
                'jenis' => 'Fasilitas Umum',
                'coordinates' => json_encode([
                    [-7.535, 110.380],
                    [-7.535, 110.385],
                    [-7.538, 110.385],
                    [-7.538, 110.380],
                ]),
                'warna' => '#3b82f6',
                'opacity' => 0.5,
                'nama_pemilik' => 'Pemerintah Desa',
                'no_hp_pemilik' => '081234567894',
                'alamat_pemilik' => 'Pusat Desa Somagede',
                'keterangan' => 'Area fasilitas umum desa',
                'foto' => 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('batas_wilayah')->insert($batasWilayahData);
    }
}
