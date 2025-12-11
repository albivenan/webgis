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
        Schema::table('penduduk', function (Blueprint $table) {
            $table->foreignId('kartu_keluarga_id')->nullable()->constrained('kartu_keluargas')->onDelete('set null');
            $table->string('status_hubungan_dalam_keluarga')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('penduduk', function (Blueprint $table) {
            $table->dropForeign(['kartu_keluarga_id']);
            $table->dropColumn(['kartu_keluarga_id', 'status_hubungan_dalam_keluarga']);
        });
    }
};
