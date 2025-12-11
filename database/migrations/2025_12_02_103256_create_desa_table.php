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
        Schema::create('desa', function (Blueprint $table) {
            $table->id();
            $table->string('nama_desa');
            $table->string('kode_desa')->unique();
            $table->string('kecamatan');
            $table->string('kabupaten');
            $table->string('provinsi');
            $table->decimal('luas_wilayah', 10, 2)->comment('dalam km²');
            $table->integer('jumlah_penduduk');
            $table->text('batas_wilayah')->comment('GeoJSON polygon');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('desa');
    }
};
