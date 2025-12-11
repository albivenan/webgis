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
        Schema::create('penggunaan_lahan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('desa_id')->constrained('desa')->onDelete('cascade');
            $table->enum('jenis', [
                'permukiman', 
                'persawahan', 
                'perkebunan', 
                'hutan', 
                'fasilitas_umum',
                'lainnya'
            ]);
            $table->decimal('luas', 10, 2)->comment('dalam hektar');
            $table->text('polygon')->comment('GeoJSON polygon');
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('penggunaan_lahan');
    }
};
