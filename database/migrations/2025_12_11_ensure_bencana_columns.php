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
        Schema::table('bencana', function (Blueprint $table) {
            // Add luas column if it doesn't exist
            if (!Schema::hasColumn('bencana', 'luas')) {
                $table->decimal('luas', 12, 2)->nullable()->comment('Area in square meters (m²) for polygon/radius types')->after('lokasi_data');
            }

            // Add warna_penanda column if it doesn't exist
            if (!Schema::hasColumn('bencana', 'warna_penanda')) {
                $table->string('warna_penanda', 7)->default('#ef4444')->comment('Hex color for polygon/circle')->after('luas');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bencana', function (Blueprint $table) {
            if (Schema::hasColumn('bencana', 'luas')) {
                $table->dropColumn('luas');
            }
            if (Schema::hasColumn('bencana', 'warna_penanda')) {
                $table->dropColumn('warna_penanda');
            }
        });
    }
};
