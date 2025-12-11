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
        Schema::create('map_events', function (Blueprint $table) {
            $table->id();
            $table->enum('event_type', ['traffic', 'accident', 'hazard', 'location']);
            $table->enum('level', ['low', 'medium', 'high'])->nullable();
            $table->enum('hazard_type', ['banjir', 'longsor', 'kriminal', 'kebakaran'])->nullable();
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->integer('radius')->nullable(); // in meters
            $table->json('polyline')->nullable();
            $table->json('polygon')->nullable();
            $table->string('image_path')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('map_events');
    }
};
