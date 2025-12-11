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
        Schema::create('infrastruktur', function (Blueprint $table) {
            $table->id();
            $table->foreignId('desa_id')->constrained('desa')->onDelete('cascade');
            $table->string('nama');
            $table->enum('jenis', [
                'jalan', 
                'jembatan', 
                'irigasi', 
                'jaringan_listrik', 
                'air_bersih'
            ]);
            $table->enum('kondisi', ['baik', 'rusak_ringan', 'rusak_berat']);
            $table->decimal('panjang', 10, 2)->nullable()->comment('dalam meter');
            $table->text('koordinat')->comment('GeoJSON LineString atau Point');
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('infrastruktur');
    }
};
