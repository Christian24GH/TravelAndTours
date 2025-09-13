<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Employee Self Service (must be first)
        if (!Schema::hasTable('employee_self_service')) {
            Schema::create('employee_self_service', function (Blueprint $table) {
                $table->id();
                $table->string('first_name');
                $table->string('middle_name')->nullable();
                $table->string('last_name');
                $table->string('suffix')->nullable();
                $table->string('department');
                $table->string('position');
                $table->string('email')->unique();
                $table->string('phone')->nullable();
                $table->string('address')->nullable();
                $table->date('birthday')->nullable();
                $table->string('civil_status')->nullable();
                $table->string('emergency_contact')->nullable();
                $table->date('hire_date');
                $table->string('manager')->nullable();
                $table->string('employee_status')->default('Active');
                $table->text('roles')->nullable();
                $table->string('profile_photo_url')->nullable();
                $table->timestamps();
            });
        }
        // Leave Requests
        if (!Schema::hasTable('leave_requests')) {
            Schema::create('leave_requests', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('employee_id');
                $table->string('type');
                $table->date('start');
                $table->date('end');
                $table->text('reason');
                $table->enum('status', ['Pending', 'Accepted', 'Denied'])->default('Pending');
                $table->timestamps();

                $table->foreign('employee_id')->references('id')->on('employee_self_service')->onDelete('cascade');
            });
        }

        // Competency Management
        if (!Schema::hasTable('competency_management')) {
            Schema::create('competency_management', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('employee_id');
                $table->unsignedBigInteger('role_id');
                $table->string('role_name');
                $table->unsignedBigInteger('competency_id');
                $table->string('competency_name');
                $table->string('competency_type');
                $table->tinyInteger('competency_level')->nullable();
                $table->date('last_assessed_date')->nullable();
                $table->timestamps();
                $table->foreign('employee_id')->references('id')->on('employee_self_service')->onDelete('cascade');
            });
        }

        // Succession Planning
        if (!Schema::hasTable('succession_planning')) {
            Schema::create('succession_planning', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('role_id');
                $table->unsignedBigInteger('employee_id');
                $table->string('readiness_level');
                $table->text('development_plan')->nullable();
                $table->string('timeline_for_readiness')->nullable();
                $table->timestamps();
                $table->foreign('employee_id')->references('id')->on('employee_self_service')->onDelete('cascade');
            });
        }
        // employee_id to users table
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'employee_id')) {
                $table->unsignedBigInteger('employee_id')->nullable()->after('id');
                $table->foreign('employee_id')->references('id')->on('employee_self_service')->onDelete('set null');
            }
        });

        // Learning Management
        if (!Schema::hasTable('learning_management')) {
            Schema::create('learning_management', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('employee_id');
                $table->string('title');
                $table->text('description')->nullable();
                $table->string('status')->default('To Do');
                $table->integer('progress')->default(0);
                $table->dateTime('due_date')->nullable();
                $table->string('file_path')->nullable();
                $table->json('quiz')->nullable();
                $table->json('quiz_answers')->nullable();
                $table->integer('quiz_score')->nullable();
                $table->date('completion_date')->nullable();
                $table->timestamps();
                $table->foreign('employee_id')->references('id')->on('employee_self_service')->onDelete('cascade');
            });
        }

        // Training Management
        if (!Schema::hasTable('training_management')) {
            Schema::create('training_management', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('employee_id')->nullable();
                $table->string('program_name');
                $table->string('provider');
                $table->string('duration');
                $table->string('target_skills');
                $table->string('status');
                $table->tinyInteger('feedback_score')->nullable();
                $table->timestamps();
                $table->foreign('employee_id')->references('id')->on('employee_self_service')->onDelete('cascade');
            });
        }
    }



    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['employee_id']);
            $table->dropColumn('employee_id');
        });
        Schema::dropIfExists('training_management');
        Schema::dropIfExists('learning_management');
        Schema::dropIfExists('employee_self_service');
        Schema::dropIfExists('succession_planning');
        Schema::dropIfExists('competency_management');
        Schema::dropIfExists('leave_requests');
    }
};
