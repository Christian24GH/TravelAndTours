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
            $table->dateTime('start_time');
            $table->dateTime('end_time');
            $table->string('purpose')->nullable();
            $table->enum('status', ['Pending', 'Confirmed', 'Cancelled'])->default('Pending');
            $table->timestamps();

            // Link vehicle to reservation
            $table->foreignId('vehicle_id')->nullable()->constrained('vehicles')->nullOnDelete();
            $table->unsignedBigInteger('employee_id')->nullable();
        });

        Schema::create('dispatches', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->dateTime('dispatch_time');
            $table->dateTime('return_time')->nullable();
            $table->enum('status', ['Dispatched', 'In Progress', 'Returned', 'Cancelled'])->default('Dispatched');
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->foreignId('reservation_id')->nullable()->constrained('reservations')->nullOnDelete();
            $table->foreignId('driver_id')->nullable()->constrained('drivers')->nullOnDelete();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dispatches');
        Schema::dropIfExists('reservations');
    }
};
