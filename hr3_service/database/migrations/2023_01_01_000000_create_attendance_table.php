<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAttendanceTable extends Migration
{
    public function up()
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('full_name', 100)->nullable();
            $table->string('position', 50)->nullable();
            $table->string('department', 50)->nullable();
            $table->string('email', 100)->nullable();
            $table->string('phone', 20)->nullable();
            $table->date('hire_date')->nullable();
            $table->string('status', 20)->nullable();
            $table->timestamps();
        });
        Schema::create('attendance', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->time('clock_in')->nullable();
            $table->time('break_in')->nullable();
            $table->time('break_out')->nullable();
            $table->time('clock_out')->nullable();
            $table->date('date');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('employees');
        Schema::dropIfExists('attendance');
    }
}