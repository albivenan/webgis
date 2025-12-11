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
        Schema::create('bencana', function (Blueprint $table) {
            $table->id();
            $table->string('nama_bencana');
            $table->enum('jenis_bencana', [
                'banjir',
                'longsor',
                'gempa',
                'kebakaran',
                'angin_puting_beliung',
                'kekeringan'
            ]);
            $table->enum('tingkat_bahaya', [
                'rendah',
                'sedang',
                'tinggi',
                'sangat_tinggi'
            ]);
            $table->enum('tipe_lokasi', ['titik', 'polygon', 'radius']);
            $table->json('lokasi_data')->comment('Stores lat/lng for point, array of coords for polygon, or center+radius for circle');
            $table->decimal('luas', 12, 2)->nullable()->comment('Area in square meters (m²) for polygon/radius types');
            $table->string('warna_penanda', 7)->default('#ef4444'); // Hex color for polygon/circle
            
            // Dates
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai')->nullable();
            
            // Status
            $table->enum('status', ['berlangsung', 'selesai'])->default('berlangsung');
            
            // Impact data
            $table->integer('korban_jiwa')->default(0);
            $table->integer('korban_luka')->default(0);
            $table->text('kerusakan_infrastruktur')->nullable();
            
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bencana');
    }
};
