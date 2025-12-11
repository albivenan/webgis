<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Fasilitas;
use App\Models\Desa;

class FasilitasSeeder extends Seeder
{
    // Define the boundary coordinates for Desa Somagede
    private const MIN_LAT = -7.539919853210392;
    private const MAX_LAT = -7.509542942047119;
    private const MIN_LNG = 109.542366027832031;
    private const MAX_LNG = 109.585929870605526;

    /**
     * Generate a random coordinate within the defined Desa Somagede boundary.
     */
    protected function generateRandomCoordinate(): array
    {
        $lat = self::MIN_LAT + (mt_rand() / mt_getrandmax()) * (self::MAX_LAT - self::MIN_LAT);
        $lng = self::MIN_LNG + (mt_rand() / mt_getrandmax()) * (self::MAX_LNG - self::MIN_LNG);
        return [$lat, $lng];
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ambil desa pertama yang ada
        $desa = Desa::first();

        if (!$desa) {
            return;
        }

        // Data fasilitas umum (dengan foto dari Unsplash - free license)
        $fasilitasUmum = [
            [
                'nama' => 'Puskesmas Somagede',
                'jenis' => 'puskesmas',
                'kondisi' => 'baik',
                'koordinat' => $this->generateRandomCoordinate(),
                'alamat_manual' => 'Jalan Utama No. 10',
                'rt' => '002',
                'rw' => '005',
                'no_telepon' => '022-1234567',
                'jam_operasional' => '07:00-16:00',
                'kapasitas' => 50,
                'tahun_dibangun' => 2010,
                'penanggung_jawab' => 'Dr. Siti Aminah',
                'keterangan' => 'Fasilitas kesehatan umum untuk warga desa',
                'tipe_akses' => 'umum',
                'foto' => 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80'
            ],
            [
                'nama' => 'SDN Somagede 1',
                'jenis' => 'sekolah_sd',
                'kondisi' => 'baik',
                'koordinat' => $this->generateRandomCoordinate(),
                'alamat_manual' => 'Jalan Pendidikan No. 5',
                'rt' => '003',
                'rw' => '005',
                'no_telepon' => '022-7654321',
                'jam_operasional' => '07:30-14:00',
                'kapasitas' => 200,
                'tahun_dibangun' => 2005,
                'penanggung_jawab' => 'Budi Santoso',
                'keterangan' => 'Sekolah dasar negeri',
                'tipe_akses' => 'umum',
                'foto' => 'https://images.unsplash.com/photo-1427504494785-cdba58dabf46?w=800&q=80'
            ],
            [
                'nama' => 'Balai Desa Somagede',
                'jenis' => 'balai_desa_pertemuan',
                'kondisi' => 'baik',
                'koordinat' => $this->generateRandomCoordinate(),
                'alamat_manual' => 'Jalan Pemerintahan No. 1',
                'rt' => '001',
                'rw' => '005',
                'no_telepon' => '022-1122334',
                'jam_operasional' => '08:00-16:00',
                'kapasitas' => 100,
                'tahun_dibangun' => 2000,
                'penanggung_jawab' => 'Kepala Desa',
                'keterangan' => 'Kantor pemerintahan desa',
                'tipe_akses' => 'umum',
                'foto' => 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80'
            ]
        ];

        // Data fasilitas privat (dengan foto dari Unsplash - free license)
        $fasilitasPrivat = [
            [
                'nama' => 'Rumah Sakit Swasta Medika',
                'jenis' => 'rumah_sakit_umum',
                'kondisi' => 'baik',
                'koordinat' => $this->generateRandomCoordinate(),
                'alamat_manual' => 'Jalan Kesehatan No. 8',
                'rt' => '002',
                'rw' => '005',
                'no_telepon' => '022-4455667',
                'jam_operasional' => '24 jam',
                'kapasitas' => 30,
                'tahun_dibangun' => 2015,
                'penanggung_jawab' => 'Dr. Ahmad Fauzi',
                'keterangan' => 'Rumah sakit swasta',
                'tipe_akses' => 'privat',
                'foto' => 'https://images.unsplash.com/photo-1631217314830-4e6b16e278c1?w=800&q=80'
            ],
            [
                'nama' => 'Toko Kelontong Sejahtera',
                'jenis' => 'pasar_tradisional',
                'kondisi' => 'baik',
                'koordinat' => $this->generateRandomCoordinate(),
                'alamat_manual' => 'Jalan Usaha No. 3',
                'rt' => '003',
                'rw' => '005',
                'no_telepon' => '022-7788990',
                'jam_operasional' => '06:00-22:00',
                'kapasitas' => 50,
                'tahun_dibangun' => 2012,
                'penanggung_jawab' => 'Siti Maryam',
                'keterangan' => 'Toko kelontong swasta',
                'tipe_akses' => 'privat',
                'foto' => 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800&q=80'
            ]
        ];

        // Masukkan data ke database
        foreach ($fasilitasUmum as $data) {
            Fasilitas::create(array_merge($data, ['desa_id' => $desa->id]));
        }

        foreach ($fasilitasPrivat as $data) {
            Fasilitas::create(array_merge($data, ['desa_id' => $desa->id]));
        }
    }
}
