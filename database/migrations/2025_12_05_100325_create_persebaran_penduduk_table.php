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
        Schema::create('persebaran_penduduk', function (Blueprint $table) {
            $table->id();
            $table->string('rt', 3);
            $table->string('rw', 3);
            $table->integer('periode_bulan'); // 1-12
            $table->integer('periode_tahun'); // e.g., 2025
            $table->integer('jumlah_laki_laki')->default(0);
            $table->integer('jumlah_perempuan')->default(0);
            $table->integer('jumlah_kelahiran')->default(0);
            $table->integer('jumlah_kematian')->default(0);
            $table->text('keterangan')->nullable();
            $table->timestamps();
            
            // Add index for faster queries
            $table->index(['rt', 'rw', 'periode_tahun', 'periode_bulan']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('persebaran_penduduk');
    }
};
