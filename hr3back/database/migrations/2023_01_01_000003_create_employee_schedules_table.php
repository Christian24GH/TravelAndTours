<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEmployeeSchedulesTable extends Migration
{
    public function up()
    {
        Schema::create('employee_schedules', function (Blueprint $table) {
            $table->integer('schedule_id')->autoIncrement();
            $table->integer('employee_id')->nullable();
            $table->integer('shift_id')->nullable();
            $table->date('schedule_date')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('employee_schedules');
    }
}