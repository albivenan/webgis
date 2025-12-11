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
        Schema::create('fasilitas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('desa_id')->constrained('desa')->onDelete('cascade');
            $table->string('nama');
            // Using string to support various types without strict enum limitations in SQLite if possible,
            // or explicitly listing all known types.
            // However, since we want to be safe with existing codebase expectations, we add all.
            $table->enum('jenis', [
                // Educational
                'sekolah_sd', 'sekolah_smp', 'sekolah_sma', 'universitas',
                // Religious
                'masjid', 'mushola', 'gereja', 'pura', 'vihara',
                // Health
                'puskesmas', 'klinik', 'rumah_sakit_umum', 'posyandu',
                // Government/Public
                'kantor_desa_kelurahan', 'kantor_kecamatan', 'kantor_pemerintah_dinas_instansi',
                'balai_desa_pertemuan', 'pasar_tradisional', 'terminal_halte',
                'pos_polisi', 'pos_damkar', 'lapangan_taman', 'stadion_gor',
                'perpustakaan_daerah', 'tempat_pemakaman_umum_tpu', 'kantor_pos',
                // Roads (Jalan) - Added for Jalan feature
                'jalan_nasional', 'jalan_provinsi', 'jalan_kabupaten', 'jalan_desa', 'jalan_lingkungan', 'jalan_setapak'
            ]);
            $table->enum('kondisi', ['baik', 'rusak_ringan', 'rusak_berat']);
            $table->text('koordinat')->comment('GeoJSON Point or LineString');
            
            // Detailed fields (merged from 2025_12_04_040315_add_detailed_fields_to_fasilitas_table.php)
            $table->text('alamat_auto')->nullable()->comment('Address from reverse geocoding');
            $table->text('alamat_manual')->nullable()->comment('Manual address input by user');
            $table->string('rt', 10)->nullable();
            $table->string('rw', 10)->nullable();
            $table->string('no_telepon', 20)->nullable();
            $table->string('jam_operasional')->nullable();
            $table->integer('kapasitas')->nullable();
            $table->year('tahun_dibangun')->nullable();
            $table->string('penanggung_jawab')->nullable();
            
            $table->text('keterangan')->nullable();
            $table->enum('tipe_akses', ['umum', 'privat', 'jalan'])->default('umum');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fasilitas');
    }
};