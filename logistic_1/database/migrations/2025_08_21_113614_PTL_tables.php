<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ================================
        // LOGISTIC 1 – Project Logistic Tracker (PLT)
        // ================================

        // Tour Project Table
        Schema::create('tour_project', function (Blueprint $table) {
            $table->id('project_id');
            $table->string('project_name', 100);
            $table->string('destination', 100)->nullable();  // Destination for the tour
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->timestamps();
            $table->timestamp('archived_at')->nullable();
        });

        // Equipment Schedule Table
        Schema::create('equipment_schedule', function (Blueprint $table) {
            $table->id('schedule_id');
            $table->unsignedBigInteger('equipment_id');  // Foreign key to equipment table
            $table->unsignedBigInteger('project_id');  // Foreign key to tour_project table
            $table->date('scheduled_date'); 
            $table->time('scheduled_time'); 
            $table->enum('status', ['pending', 'approved', 'completed'])->default('pending');  // Schedule status
            $table->boolean('approved')->default(false);  // Approval flag
            $table->timestamps();
            $table->timestamp('archived_at')->nullable();

            // Foreign key constraints
            $table->foreign('equipment_id')->references('equipment_id')->on('equipment')->onDelete('cascade');
            $table->foreign('project_id')->references('project_id')->on('tour_project')->onDelete('cascade');
        });

        // Delivery Table
        Schema::create('delivery', function (Blueprint $table) {
            $table->id('delivery_id');
            $table->unsignedBigInteger('schedule_id');  // Foreign key to equipment_schedule table
            $table->string('driver_name', 100)->nullable();
            $table->enum('status', ['pending', 'delivered', 'failed'])->default('pending');  // Delivery status
            $table->string('issues_notes', 255)->nullable();  // Notes for any issues during delivery
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();
            $table->timestamp('archived_at')->nullable(); 

            // Foreign key constraints
            $table->foreign('schedule_id')->references('schedule_id')->on('equipment_schedule')->onDelete('cascade');
        });
    }

    public function down(): void
    {
  
        Schema::dropIfExists('delivery');
        Schema::dropIfExists('equipment_schedule');
        Schema::dropIfExists('tour_project');
    }
};
