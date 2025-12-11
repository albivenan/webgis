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
        // Add foto to batas_wilayah if not exists
        if (Schema::hasTable('batas_wilayah') && !Schema::hasColumn('batas_wilayah', 'foto')) {
            Schema::table('batas_wilayah', function (Blueprint $table) {
                $table->string('foto')->nullable()->after('keterangan');
            });
        }

        // Add foto to lokasi_penting if not exists (should already exist)
        if (Schema::hasTable('lokasi_penting') && !Schema::hasColumn('lokasi_penting', 'foto')) {
            Schema::table('lokasi_penting', function (Blueprint $table) {
                $table->string('foto')->nullable()->after('deskripsi');
            });
        }

        // Add foto to rumah if not exists (should already exist as foto_rumah)
        if (Schema::hasTable('rumah') && !Schema::hasColumn('rumah', 'foto')) {
            Schema::table('rumah', function (Blueprint $table) {
                $table->string('foto')->nullable()->after('keterangan');
            });
        }

        // Add foto to fasilitas if not exists
        if (Schema::hasTable('fasilitas') && !Schema::hasColumn('fasilitas', 'foto')) {
            Schema::table('fasilitas', function (Blueprint $table) {
                $table->string('foto')->nullable()->after('tipe_akses');
            });
        }

        // Add foto to bencana if not exists
        if (Schema::hasTable('bencana') && !Schema::hasColumn('bencana', 'foto')) {
            Schema::table('bencana', function (Blueprint $table) {
                $table->string('foto')->nullable()->after('keterangan');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop foto columns
        if (Schema::hasTable('batas_wilayah') && Schema::hasColumn('batas_wilayah', 'foto')) {
            Schema::table('batas_wilayah', function (Blueprint $table) {
                $table->dropColumn('foto');
            });
        }

        if (Schema::hasTable('lokasi_penting') && Schema::hasColumn('lokasi_penting', 'foto')) {
            Schema::table('lokasi_penting', function (Blueprint $table) {
                $table->dropColumn('foto');
            });
        }

        if (Schema::hasTable('rumah') && Schema::hasColumn('rumah', 'foto')) {
            Schema::table('rumah', function (Blueprint $table) {
                $table->dropColumn('foto');
            });
        }

        if (Schema::hasTable('fasilitas') && Schema::hasColumn('fasilitas', 'foto')) {
            Schema::table('fasilitas', function (Blueprint $table) {
                $table->dropColumn('foto');
            });
        }

        if (Schema::hasTable('bencana') && Schema::hasColumn('bencana', 'foto')) {
            Schema::table('bencana', function (Blueprint $table) {
                $table->dropColumn('foto');
            });
        }
    }
};
