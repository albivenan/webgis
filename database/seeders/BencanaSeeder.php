<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BencanaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Koordinat dalam boundary Desa Somagede
        // Center: [-7.5360639, 110.3850326]
        // Foto dari Unsplash (free license)
        
        $bencanaData = [
            [
                'nama_bencana' => 'Banjir Bandang Area Utara',
                'jenis_bencana' => 'banjir',
                'tingkat_bahaya' => 'tinggi',
                'tipe_lokasi' => 'polygon',
                'lokasi_data' => json_encode([
                    [-7.530, 110.380],
                    [-7.530, 110.385],
                    [-7.533, 110.385],
                    [-7.533, 110.380],
                ]),
                'luas' => 1234567.89,
                'warna_penanda' => '#3b82f6',
                'tanggal_mulai' => now()->subDays(5),
                'tanggal_selesai' => null,
                'status' => 'berlangsung',
                'korban_jiwa' => 2,
                'korban_luka' => 5,
                'kerusakan_infrastruktur' => 'Jembatan rusak, jalan terputus',
                'keterangan' => 'Banjir akibat curah hujan tinggi',
                'foto' => 'https://images.unsplash.com/photo-1559027615-cd2628902d4a?w=800&q=80',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_bencana' => 'Longsor Tebing Barat',
                'jenis_bencana' => 'longsor',
                'tingkat_bahaya' => 'sangat_tinggi',
                'tipe_lokasi' => 'radius',
                'lokasi_data' => json_encode([
                    'center' => ['lat' => -7.542, 'lng' => 110.375],
                    'radius' => 300,
                ]),
                'luas' => 282743.34,
                'warna_penanda' => '#ef4444',
                'tanggal_mulai' => now()->subDays(3),
                'tanggal_selesai' => null,
                'status' => 'berlangsung',
                'korban_jiwa' => 1,
                'korban_luka' => 3,
                'kerusakan_infrastruktur' => 'Rumah tertimbun, jalan amblas',
                'keterangan' => 'Longsor akibat erosi tebing',
                'foto' => 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_bencana' => 'Kebakaran Hutan Timur',
                'jenis_bencana' => 'kebakaran',
                'tingkat_bahaya' => 'tinggi',
                'tipe_lokasi' => 'polygon',
                'lokasi_data' => json_encode([
                    [-7.535, 110.390],
                    [-7.535, 110.395],
                    [-7.540, 110.395],
                    [-7.540, 110.390],
                ]),
                'luas' => 2500000.00,
                'warna_penanda' => '#f97316',
                'tanggal_mulai' => now()->subDays(2),
                'tanggal_selesai' => null,
                'status' => 'berlangsung',
                'korban_jiwa' => 0,
                'korban_luka' => 2,
                'kerusakan_infrastruktur' => 'Hutan terbakar, asap tebal',
                'keterangan' => 'Kebakaran hutan liar',
                'foto' => 'https://images.unsplash.com/photo-1432405972618-c60b0b51e1f1?w=800&q=80',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_bencana' => 'Gempa Bumi Ringan',
                'jenis_bencana' => 'gempa',
                'tingkat_bahaya' => 'sedang',
                'tipe_lokasi' => 'titik',
                'lokasi_data' => json_encode([
                    'lat' => -7.536,
                    'lng' => 110.385,
                ]),
                'luas' => null,
                'warna_penanda' => '#facc15',
                'tanggal_mulai' => now()->subDays(1),
                'tanggal_selesai' => now()->subDays(1),
                'status' => 'selesai',
                'korban_jiwa' => 0,
                'korban_luka' => 0,
                'kerusakan_infrastruktur' => 'Beberapa bangunan retak',
                'keterangan' => 'Gempa bumi dengan magnitudo 4.5',
                'foto' => 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_bencana' => 'Angin Puting Beliung Selatan',
                'jenis_bencana' => 'angin_puting_beliung',
                'tingkat_bahaya' => 'tinggi',
                'tipe_lokasi' => 'radius',
                'lokasi_data' => json_encode([
                    'center' => ['lat' => -7.545, 'lng' => 110.385],
                    'radius' => 250,
                ]),
                'luas' => 196349.54,
                'warna_penanda' => '#6b7280',
                'tanggal_mulai' => now()->subDays(7),
                'tanggal_selesai' => now()->subDays(7),
                'status' => 'selesai',
                'korban_jiwa' => 1,
                'korban_luka' => 4,
                'kerusakan_infrastruktur' => 'Atap rumah terbang, pohon tumbang',
                'keterangan' => 'Angin puting beliung melanda area selatan',
                'foto' => 'https://images.unsplash.com/photo-1534274988757-a28bf1a4c817?w=800&q=80',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('bencana')->insert($bencanaData);
    }
}
