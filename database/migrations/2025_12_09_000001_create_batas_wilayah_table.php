<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('batas_wilayah', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->string('jenis'); // Pertanian, Pemukiman, Perkebunan, Hutan, Industri, Fasilitas Umum, Lainnya
            $table->json('coordinates'); // Array of [lat, lng] pairs for polygon
            $table->string('warna', 7); // Hex color code
            $table->decimal('opacity', 3, 2)->default(0.5); // 0.00 to 1.00
            $table->decimal('luas', 12, 2)->nullable()->comment('Area in square meters (m²)');
            
            // Owner information
            $table->string('nama_pemilik')->nullable();
            $table->string('no_hp_pemilik', 20)->nullable();
            $table->text('alamat_pemilik')->nullable();
            
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('batas_wilayah');
    }
};
