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
        Schema::create('drivers', function(Blueprint $table){
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('name');
        });

        Schema::create('performances', function(Blueprint $table){
            $table->id();
            $table->uuid('uuid')->unique();
            $table->decimal('rating', 3, 1);

            $table->foreignId('driver_id')->nullable()->constrained('drivers')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('performance');
        Schema::dropIfExists('drivers');
    }
};
