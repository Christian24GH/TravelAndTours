<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // ==========================
        // 1) ALMS Vehicles Table
        // ==========================
        Schema::create('alms_vehicles', function (Blueprint $table) {
            $table->id();
            $table->string('vin', 17)->unique(); // Vehicle Identification Number
            $table->string('plate_number', 15)->unique();
            $table->string('make'); // Toyota, Ford, etc.
            $table->string('model');
            $table->year('year');
            $table->string('type')->comment('Sedan, SUV, Truck, Van, etc.');
            $table->string('capacity')->nullable()->comment('Passengers or weight in kg');
            $table->date('acquisition_date')->nullable();
            $table->enum('status', ['Available', 'Reserved', 'Under Maintenance', 'Retired'])->default('available');
            $table->timestamps();
        });

        // ==========================
        // 2) Asset
        // ==========================
        Schema::create('asset', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('equipment_id')->nullable(); // Link to SWS equipment
            $table->unsignedBigInteger('vehicle_id')->nullable(); // Link to ALMS vehicles
            $table->string('asset_code', 50)->unique();   // Unique human-readable asset code
            $table->string('qr_token', 255)->unique();    // QR token for asset tracking
            $table->text('description')->nullable();      // Optional description
            $table->unsignedBigInteger('assigned_project_id')->nullable(); // Link to tour project (if relevant)
            $table->timestamps();
            $table->timestamp('archived_at')->nullable(); // Archive date

            // Foreign key relationships
            $table->foreign('equipment_id')
                ->references('equipment_id')->on('equipment') // Link to SWS equipment
                ->onDelete('set null');

            $table->foreign('vehicle_id')
                ->references('id')->on('alms_vehicles') // Link to ALMS vehicles
                ->onDelete('set null');

            $table->foreign('assigned_project_id')
                ->references('project_id')->on('tour_project')
                ->onDelete('set null');
        });

        // ==========================
        // 3) Asset Usage (History)
        // ==========================
        Schema::create('asset_usage', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('asset_id'); // Link to asset
            $table->integer('usage_hours')->default(0); // Total usage in hours
            $table->float('mileage')->nullable(); // Mileage for vehicles
            $table->date('usage_date'); // Date of usage
            $table->timestamps();
            $table->timestamp('archived_at')->nullable(); // Archive date

            // Foreign key relationship
            $table->foreign('asset_id')
                ->references('id')->on('asset')
                ->onDelete('cascade');
        });

        // ==========================
        // 4) Maintenance Records
        // ==========================
        Schema::create('maintenance', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('asset_id'); // Link to asset
            $table->enum('maintenance_type', ['repair', 'replacement', 'checkup']); // Maintenance type
            $table->date('maintenance_date'); // Date of maintenance
            $table->decimal('cost', 10, 2)->nullable(); // Maintenance cost
            $table->text('notes')->nullable(); // Additional notes
            $table->timestamps();
            $table->timestamp('archived_at')->nullable(); // Archive date

            // Foreign key relationship
            $table->foreign('asset_id')
                ->references('id')->on('asset')
                ->onDelete('cascade');
        });

        // ==========================
        // 5) Maintenance Alerts
        // ==========================
        Schema::create('maintenance_alert', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('asset_id'); // Link to asset
            $table->enum('alert_type', ['usage_limit', 'time_based', 'critical_issue']); // Type of alert
            $table->string('alert_message', 255); // Alert message content
            $table->enum('status', ['pending', 'resolved'])->default('pending'); // Alert status
            $table->timestamp('resolved_at')->nullable(); // Date the alert was resolved
            $table->timestamps();
            $table->timestamp('archived_at')->nullable(); // Archive date

            // Foreign key relationship
            $table->foreign('asset_id')
                ->references('id')->on('asset')
                ->onDelete('cascade');
        });

        // ==========================
        // 6) Fleet Integration (Logistic 2)
        // ==========================
        Schema::create('fleet_integration', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('vehicle_id'); // Link to ALMS vehicles
            $table->unsignedBigInteger('asset_id'); // Link to ALMS asset data
            $table->timestamps();

            // Foreign key relationships
            $table->foreign('vehicle_id')
                ->references('id')->on('alms_vehicles') // Link to ALMS vehicles
                ->onDelete('cascade');

            $table->foreign('asset_id')
                ->references('id')->on('asset') // Link to asset
                ->onDelete('cascade');
        });

        // ==========================
        // 7) SWS Integration
        // ==========================
        Schema::create('sws_integration', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('sws_asset_id'); // Link to SWS asset record
            $table->unsignedBigInteger('asset_id'); // Link to ALMS asset data
            $table->timestamps();

            // Foreign key relationships
            $table->foreign('sws_asset_id')
                ->references('id')->on('sws_assets') // Link to SWS assets
                ->onDelete('cascade');

            $table->foreign('asset_id')
                ->references('id')->on('asset') // Link to ALMS assets
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        // Drop the tables if rollback occurs
        Schema::dropIfExists('sws_integration');
        Schema::dropIfExists('fleet_integration');
        Schema::dropIfExists('maintenance_alert');
        Schema::dropIfExists('maintenance');
        Schema::dropIfExists('asset_usage');
        Schema::dropIfExists('alms_vehicles');
        Schema::dropIfExists('asset');
    }
};
