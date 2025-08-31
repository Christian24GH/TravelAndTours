<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Employees
        Schema::create('employees', function (Blueprint $table) {
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
            $table->string('profile_photo_url')->nullable();
            $table->timestamps();
        });

        // Courses (for Learning Management)
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('employee_id');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('status')->default('To Do');
            $table->integer('progress')->default(0);
            $table->date('due_date')->nullable();
            $table->timestamps();
        });

        // employee_id to users table
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('employee_id')->nullable()->after('id');
            $table->foreign('employee_id')->references('id')->on('employees')->onDelete('set null');
        });
        // Roles
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('role_name');
            $table->string('succession_plan_status')->nullable();
            $table->timestamps();
        });

        // Competencies
        Schema::create('competencies', function (Blueprint $table) {
            $table->id();
            $table->string('competency_name');
            $table->string('competency_type');
            $table->unsignedBigInteger('role_id');
            $table->timestamps();
            $table->foreign('role_id')->references('id')->on('roles')->onDelete('cascade');
        });

        // Employee Competencies
        Schema::create('employee_competencies', function (Blueprint $table) {
            $table->unsignedBigInteger('employee_id');
            $table->unsignedBigInteger('competency_id');
            $table->tinyInteger('competency_level');
            $table->date('last_assessed_date')->nullable();
            $table->primary(['employee_id', 'competency_id']);
            $table->foreign('competency_id')->references('id')->on('competencies')->onDelete('cascade');
            $table->foreign('employee_id')->references('id')->on('employees')->onDelete('cascade');
        });

        // Learning Courses
        Schema::create('learning_courses', function (Blueprint $table) {
            $table->id();
            $table->string('course_name');
            $table->string('course_type');
            $table->string('duration');
            $table->string('skills_covered');
            $table->timestamps();
        });

        // Employee Learning
        Schema::create('employee_learning', function (Blueprint $table) {
            $table->unsignedBigInteger('employee_id');
            $table->unsignedBigInteger('course_id');
            $table->string('status');
            $table->date('completion_date')->nullable();
            $table->primary(['employee_id', 'course_id']);
            $table->foreign('course_id')->references('id')->on('learning_courses')->onDelete('cascade');
            $table->foreign('employee_id')->references('id')->on('employees')->onDelete('cascade');
        });

        // Training Programs
        Schema::create('training_programs', function (Blueprint $table) {
            $table->id();
            $table->string('program_name');
            $table->string('provider');
            $table->string('duration');
            $table->string('target_skills');
            $table->timestamps();
        });

        // Employee Training
        Schema::create('employee_training', function (Blueprint $table) {
            $table->unsignedBigInteger('employee_id');
            $table->unsignedBigInteger('training_program_id');
            $table->string('status');
            $table->tinyInteger('feedback_score')->nullable();
            $table->primary(['employee_id', 'training_program_id']);
            $table->foreign('training_program_id')->references('id')->on('training_programs')->onDelete('cascade');
            $table->foreign('employee_id')->references('id')->on('employees')->onDelete('cascade');
        });

        // Succession Plans
        Schema::create('succession_plans', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('role_id');
            $table->unsignedBigInteger('employee_id');
            $table->string('readiness_level');
            $table->text('development_plan')->nullable();
            $table->string('timeline_for_readiness')->nullable();
            $table->timestamps();
            $table->foreign('role_id')->references('id')->on('roles')->onDelete('cascade');
            $table->foreign('employee_id')->references('id')->on('employees')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['employee_id']);
            $table->dropColumn('employee_id');
        });
        Schema::dropIfExists('succession_plans');
        Schema::dropIfExists('employee_training');
        Schema::dropIfExists('training_programs');
        Schema::dropIfExists('employee_learning');
        Schema::dropIfExists('learning_courses');
        Schema::dropIfExists('employee_competencies');
        Schema::dropIfExists('competencies');
        Schema::dropIfExists('roles');
        Schema::dropIfExists('courses');
        Schema::dropIfExists('employees');
    }
};
