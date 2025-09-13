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

            $table->string('vin', 17)->unique()->index()->comment('Vehicle Identification Number');
            $table->string('plate_number', 15)->unique()->index();
            $table->string('make'); // Toyota, Ford, etc.
            $table->string('model');
            $table->year('year');
            $table->string('type')->comment('Sedan, SUV, Truck, Van, etc.');

            $table->decimal('capacity', 8, 2)->nullable()->comment('Weight in kg');
            $table->integer('seats')->nullable()->comment('Passenger seats');
            $table->decimal('fuel_efficiency', 5, 2)->comment('Liters per kilometer');
            $table->date('acquisition_date')->nullable();

            $table->enum('status', ['Available', 'Reserved', 'Under Maintenance', 'Retired'])
                ->default('available')
                ->index();

            $table->string('image_path')->nullable()->comment('Vehicle image path');
            
            $table->timestamps();
            $table->softDeletes();
        });


        Schema::create('vehicle_compliance', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->nullable()->constrained('vehicles')->nullOnDelete();
            $table->enum('document_type', ['registration', 'insurance', 'inspection']);
            $table->string('document_number')->nullable();
            $table->string('provider')->nullable();
            $table->date('issue_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->string('document_file')->nullable(); // Path to uploaded file
            $table->timestamps();
        });


        Schema::create('vehicle_insurance', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('vehicle_id')->nullable()->constrained('vehicles')->nullOnDelete();
            $table->string('provider');
            $table->string('policy_number')->unique();
            $table->text('coverage_details')->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', ['Active', 'Expired', 'Cancelled'])->default('Active');
            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_insurance');
        Schema::dropIfExists('vehicle_compliance');
       // Schema::dropIfExists('vehicle_maintenance');
        Schema::dropIfExists('vehicles');
    }
};
