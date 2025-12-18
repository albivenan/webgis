<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::firstOrCreate(
            ['email' => 'tester@example.com'],
            [
                'name' => 'Tester',
                'password' => bcrypt('password'), // Ganti dengan password yang aman
            ]
        );

        // Seed GIS data
        $this->call([
            DesaSeeder::class,
            KartuKeluargaSeeder::class,
            PersebaranPendudukSeeder::class,
            PendudukSeeder::class,
        ]);
    }
}
