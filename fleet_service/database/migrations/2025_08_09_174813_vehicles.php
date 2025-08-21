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
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->string('vin', 17)->unique(); // Vehicle Identification Number
            $table->string('plate_number', 15)->unique();
            $table->string('make'); // Toyota, Ford, etc.
            $table->string('model');
            $table->year('year');
            $table->string('type')->comment('Sedan, SUV, Truck, Van, etc.');
            $table->string('capacity')->nullable()->comment('Passengers or weight in kg');
            $table->date('acquisition_date')->nullable();

            // Instead of another table, track vehicle lifecycle state here
            $table->enum('status', ['Available', 'Reserved', 'Under Maintenance', 'Retired'])->default('available');

            $table->timestamps();
        });

        /*
        Schema::create('vehicle_compliance', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained('vehicles')->onDelete('cascade');
            $table->enum('document_type', ['registration', 'insurance', 'inspection']);
            $table->string('document_number')->nullable();
            $table->string('provider')->nullable();
            $table->date('issue_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->string('document_file')->nullable(); // Path to uploaded file
            $table->timestamps();
        });
        */
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_compliance');
        Schema::dropIfExists('vehicle_maintenance');
        Schema::dropIfExists('vehicles');
    }
};
