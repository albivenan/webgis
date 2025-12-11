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
        Schema::table('persebaran_penduduk', function (Blueprint $table) {
            $table->integer('jumlah_kk')->default(0)->after('periode_tahun');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('persebaran_penduduk', function (Blueprint $table) {
            $table->dropColumn('jumlah_kk');
        });
    }
};
