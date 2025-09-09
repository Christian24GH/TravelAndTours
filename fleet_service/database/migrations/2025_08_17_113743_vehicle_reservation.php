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
            $table->dateTime('start_time');
            $table->dateTime('end_time');
            $table->string('purpose')->nullable();
            $table->string('pickup');
            $table->string('dropoff');
            $table->enum('status', ['Pending', 'Confirmed', 'Cancelled'])->default('Pending');
            $table->timestamps();

            $table->uuid('requestor_uuid')->nullable();
        });

        Schema::create('trip_data', function (Blueprint $table){
            $table->id();
            $table->uuid('uuid')->unique();
            $table->decimal('pretrip_cost', 10, 2)->nullable();
            $table->decimal('pretrip_distance', 10, 2)->nullable();
            $table->integer('pretrip_duration')->nullable();
            $table->json('pretrip_geometry')->nullable();

            $table->foreignId('reservation_id')->nullable()->constrained('reservations')->nullOnDelete();
        });

        Schema::create('assignments', function (Blueprint $table){
            $table->id();

            $table->foreignId('reservation_id')->nullable()->constrained('reservations')->nullOnDelete();
            $table->foreignId('vehicle_id')->nullable()->constrained('vehicles')->nullOnDelete();

            $table->uuid('driver_uuid')->nullable();
            $table->foreign('driver_uuid')
                ->nullable()
                ->references('uuid')
                ->on('drivers')
                ->nullOnDelete();

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

            $table->timestamps();

            $table->foreignId('assignment_id')
                ->nullable()
                ->constrained('assignments')
                ->nullOnDelete();
        });

        
        Schema::create('dispatch_locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dispatch_id')
                ->constrained('dispatches')
                ->cascadeOnDelete();

            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->dateTime('recorded_at')->useCurrent();

            $table->decimal('speed', 6, 2)->nullable();    // km/h or mph
            $table->decimal('heading', 5, 2)->nullable();  // direction in degrees
            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dispatch_locations');
        Schema::dropIfExists('dispatches');
        Schema::dropIfExists('assignments');
        Schema::dropIfExists('trip_data');
        Schema::dropIfExists('reservations');
    }
};
