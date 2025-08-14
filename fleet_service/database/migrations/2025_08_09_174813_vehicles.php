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
        Schema::create('vehicles', function (Blueprint $table){
            $table->id();
            $table->string('vin', 20)->unique(); // Vehicle Identification Number
            $table->string('plate_number', 15)->unique();
            $table->string('make'); // Toyota, Ford, etc.
            $table->string('model');
            $table->year('year');
            $table->string('type')->comment('Sedan, SUV, Truck, Van, etc.');
            $table->integer('capacity')->nullable()->comment('Passengers or weight in kg');
            $table->date('acquisition_date')->nullable();
            $table->enum('status', ['active', 'under_maintenance', 'retired'])->default('active');
            $table->timestamps();
        });

        Schema::create('vehicle_maintenance', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained('vehicles')->onDelete('cascade');
            $table->date('service_date');
            $table->string('service_type')->comment('Repair, Preventive, Inspection');
            $table->string('service_provider')->nullable();
            $table->decimal('labor_cost', 10, 2)->default(0);
            $table->decimal('total_cost', 10, 2)->default(0)->comment('Labor + parts total');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

         Schema::create('vehicle_maintenance_parts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('maintenance_id')->constrained('vehicle_maintenance')->onDelete('cascade');
            $table->string('part_name');
            $table->integer('quantity')->default(1);
            $table->decimal('unit_cost', 10, 2)->default(0);
            $table->decimal('total_cost', 10, 2)->default(0)->comment('quantity × unit_cost');
            $table->timestamps();
        });

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
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_compliance');
        Schema::dropIfExists('vehicle_maintenance_parts');
        Schema::dropIfExists('vehicle_maintenance');
        Schema::dropIfExists('vehicles');
    }
};
