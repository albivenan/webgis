<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PendudukSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = \Faker\Factory::create('id_ID');

        // Coordinates range for Desa Somagede (approximate)
        $minLat = -7.555;
        $maxLat = -7.535;
        $minLng = 109.635;
        $maxLng = 109.655;

        for ($i = 0; $i < 50; $i++) {
            \App\Models\Penduduk::create([
                'nik' => $faker->unique()->nik(),
                'nama_lengkap' => $faker->name(),
                'jenis_kelamin' => $faker->randomElement(['L', 'P']),
                'tempat_lahir' => $faker->city(),
                'tanggal_lahir' => $faker->date(),
                'alamat' => $faker->address(),
                'rt' => str_pad($faker->numberBetween(1, 10), 3, '0', STR_PAD_LEFT),
                'rw' => str_pad($faker->numberBetween(1, 5), 3, '0', STR_PAD_LEFT),
                'status_perkawinan' => $faker->randomElement(['Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati']),
                'pekerjaan' => $faker->jobTitle(),
                'latitude' => $faker->latitude($minLat, $maxLat),
                'longitude' => $faker->longitude($minLng, $maxLng),
                'foto_rumah' => null,
            ]);
        }
    }
}
