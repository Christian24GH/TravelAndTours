<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ==========================
        // 1) Equipment Categories
        // ==========================
        Schema::create('equipment_category', function (Blueprint $table) {
            $table->id('category_id');
            $table->string('category_name', 100)->unique(); // Unique category name
            $table->timestamps(); 
            $table->timestamp('archived_at')->nullable();
        });

        // ==========================
        // 2) Storage Locations
        // ==========================
        Schema::create('storage_location', function (Blueprint $table) {
            $table->id('storage_location_id');
            $table->string('location_name', 100)->unique(); // Unique location name
            $table->text('description')->nullable(); // Description of the storage location
            $table->timestamps();
            $table->timestamp('archived_at')->nullable(); 
        });

        // ==========================
        // 3) Equipment
        // ==========================
        Schema::create('equipment', function (Blueprint $table) {
            $table->id('equipment_id'); // Primary key
            $table->string('name', 100); // Equipment name
            $table->text('description')->nullable(); // Equipment description

            // Foreign key to equipment_category
            $table->foreignId('category_id')
                  ->nullable()
                  ->constrained('equipment_category', 'category_id')
                  ->nullOnDelete();

            $table->integer('stock_quantity')->default(0);

            // Foreign key to storage_location
            $table->foreignId('storage_location_id')
                  ->nullable()
                  ->constrained('storage_location', 'storage_location_id')
                  ->nullOnDelete();

            $table->enum('status', ['active', 'archived'])->default('active');
            $table->timestamps();
        });

        // ==========================
        // 4) SWS Assets Table
        // ==========================
        Schema::create('sws_assets', function (Blueprint $table) {
            $table->id();
            $table->string('asset_code', 50)->unique(); // Asset code
            $table->string('description')->nullable(); // Asset description
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sws_assets');
        Schema::dropIfExists('equipment');
        Schema::dropIfExists('equipment_category');
        Schema::dropIfExists('storage_location');
    }
};
