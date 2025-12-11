<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\PersebaranPenduduk;

class PersebaranPendudukSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing data
        PersebaranPenduduk::truncate();

        // Define RT/RW combinations
        $rtRwCombinations = [
            ['rt' => '001', 'rw' => '001'],
            ['rt' => '002', 'rw' => '001'],
            ['rt' => '003', 'rw' => '001'],
            ['rt' => '001', 'rw' => '002'],
            ['rt' => '002', 'rw' => '002'],
            ['rt' => '003', 'rw' => '002'],
            ['rt' => '001', 'rw' => '003'],
            ['rt' => '002', 'rw' => '003'],
        ];

        // Current year and last 6 months
        $currentYear = date('Y');
        $currentMonth = date('n');
        
        // Generate data for the last 6 months
        for ($i = 5; $i >= 0; $i--) {
            $month = $currentMonth - $i;
            $year = $currentYear;
            
            // Adjust for previous year if needed
            if ($month <= 0) {
                $month += 12;
                $year -= 1;
            }

            foreach ($rtRwCombinations as $area) {
                // Base population varies by area (realistic distribution)
                $basePopulation = rand(80, 200);
                
                // Gender distribution (roughly 50-50 with slight variation)
                $malePct = rand(48, 52) / 100;
                $jumlahLakiLaki = (int)($basePopulation * $malePct);
                $jumlahPerempuan = $basePopulation - $jumlahLakiLaki;

                // Births: 0-3 per month per RT (realistic for small areas)
                $jumlahKelahiran = rand(0, 3);

                // Deaths: 0-2 per month per RT (realistic mortality)
                $jumlahKematian = rand(0, 2);

                // Add some variation to population over time
                // Population can grow slightly due to births and migration
                if ($i < 5) {
                    $jumlahLakiLaki += rand(-2, 3);
                    $jumlahPerempuan += rand(-2, 3);
                }

                // Ensure non-negative values
                $jumlahLakiLaki = max(0, $jumlahLakiLaki);
                $jumlahPerempuan = max(0, $jumlahPerempuan);

                // Generate contextual notes for some entries
                $keterangan = null;
                if (rand(1, 4) == 1) { // 25% chance of having notes
                    $notes = [
                        'Data hasil sensus bulanan',
                        'Terdapat migrasi masuk dari luar daerah',
                        'Beberapa keluarga pindah ke wilayah lain',
                        'Data sudah diverifikasi oleh ketua RT',
                        'Peningkatan kelahiran bulan ini',
                        'Data lengkap dan akurat',
                    ];
                    $keterangan = $notes[array_rand($notes)];
                }

                PersebaranPenduduk::create([
                    'rt' => $area['rt'],
                    'rw' => $area['rw'],
                    'periode_bulan' => $month,
                    'periode_tahun' => $year,
                    'jumlah_laki_laki' => $jumlahLakiLaki,
                    'jumlah_perempuan' => $jumlahPerempuan,
                    'jumlah_kelahiran' => $jumlahKelahiran,
                    'jumlah_kematian' => $jumlahKematian,
                    'keterangan' => $keterangan,
                ]);
            }
        }

        $this->command->info('Persebaran Penduduk seeder completed successfully!');
        $this->command->info('Created data for ' . count($rtRwCombinations) . ' RT/RW areas across 6 months.');
        $this->command->info('Total records: ' . PersebaranPenduduk::count());
    }
}
