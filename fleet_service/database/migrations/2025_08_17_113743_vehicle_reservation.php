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
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('batch_number', 50);
            $table->datetime('start_date');
            $table->datetime('end_date')->nullable();
            $table->string('purpose')->nullable();
            $table->enum('status', ['Pending', 'Confirmed', 'Cancelled'])->default('Pending');
            $table->uuid('requestor_uuid')->nullable();
            $table->timestamps();
        });

        Schema::create('assignments', function (Blueprint $table) {
            $table->id();
            $table->uuid('driver_uuid')->nullable();
            $table->foreignId('reservation_id')->nullable()->constrained('reservations')->nullOnDelete();
            $table->foreignId('vehicle_id')->nullable()->constrained('vehicles')->nullOnDelete();
            
            $table->foreign('driver_uuid')->references('uuid')->on('drivers')->nullOnDelete();
            $table->timestamps();
        });
        
        // stores locations in sequence
        Schema::create('trip_route', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('start_address');
            
            // stores location in pairs
            $table->decimal('start_latitude', 10, 7)->nullable();
            $table->decimal('start_longitude', 10, 7)->nullable();

             $table->string('end_address');
            $table->decimal('end_latitude', 10, 7)->nullable();
            $table->decimal('end_longitude', 10, 7)->nullable();

            $table->unsignedInteger('sequence')->default(0); // order in the trip

            $table->foreignId('reservation_id')->nullable()->constrained('reservations')->nullOnDelete();

            $table->timestamps();
        });

        Schema::create('trip_metrics', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            // Define cost type: Pretrip, Posttrip, or others
            $table->enum('type', ['Pretrip', 'Posttrip'])->default('Pretrip');

            // Generic metrics calculates distance between 2 points from a single trip_route record
            $table->decimal('distance', 10, 2)->nullable();  // in km
            $table->integer('duration')->nullable();         // in minutes
            $table->json('geometry')->nullable();            // GeoJSON or encoded polyline

            $table->foreignId('trip_route_id')->nullable()->constrained('trip_route')->nullOnDelete();

            $table->timestamps();
        });

        Schema::create('dispatches', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            $table->dateTime('scheduled_time');
            $table->dateTime('start_time')->nullable();   // when trip begins
            $table->dateTime('arrival_time')->nullable(); // arrived at pickup
            $table->dateTime('return_time')->nullable();  // trip completed

            $table->enum('status', [
                'Scheduled',
                'Preparing',
                'Dispatched',
                'Arrived at Pickup',
                'On Route',
                'Completed',
                'Cancelled',
                'Closed',
            ])->default('Scheduled');

            $table->text('remarks')->nullable();

            // Optional audit fields
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamp('closed_at')->nullable();

            $table->foreignId('assignment_id')->nullable()->constrained('assignments')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('route_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dispatch_id')->constrained('dispatches')->cascadeOnDelete();

            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->dateTime('recorded_at')->useCurrent();

            $table->decimal('speed', 6, 2)->nullable();    // km/h
            $table->decimal('heading', 5, 2)->nullable();  // direction in degrees
            $table->timestamps();
        });

        Schema::create('dispatch_analytics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dispatch_id')->constrained('dispatches')->cascadeOnDelete();

            $table->decimal('total_distance', 10, 2)->nullable();
            $table->integer('total_duration')->nullable(); // in minutes
            $table->decimal('fuel_used', 10, 2)->nullable(); // liters
            $table->decimal('avg_speed', 6, 2)->nullable();
            $table->decimal('max_speed', 6, 2)->nullable();
            $table->timestamps();
        });

        Schema::create('driver_performance', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('assignment_id')
                ->nullable()
                ->constrained('assignments')
                ->nullOnDelete();
        });

        Schema::create('trip_metrics_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trip_route_id')->constrained('trip_route')->cascadeOnDelete();
            $table->decimal('distance', 10, 2)->nullable();
            $table->integer('duration')->nullable();
            $table->decimal('fuel_price', 10, 2)->nullable();       // snapshot price
            $table->decimal('fuel_efficiency', 10, 2)->nullable();  // snapshot efficiency
            $table->decimal('cost', 10, 2)->nullable();             // frozen cost value
            $table->timestamps();
        });
    }  

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trip_metrics_history');
        Schema::dropIfExists('driver_performance');
        Schema::dropIfExists('dispatch_analytics');
        Schema::dropIfExists('route_log');
        Schema::dropIfExists('dispatches');
        Schema::dropIfExists('trip_metrics');
        Schema::dropIfExists('trip_route');
        Schema::dropIfExists('assignments');
        Schema::dropIfExists('reservations');
    }
};
