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
            $table->string('foto')->nullable()->after('keterangan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bencana', function (Blueprint $table) {
            if (Schema::hasColumn('bencana', 'foto')) {
                $table->dropColumn('foto');
            }
        });
    }
};
