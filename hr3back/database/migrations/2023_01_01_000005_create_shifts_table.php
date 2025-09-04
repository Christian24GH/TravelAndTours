<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateShiftsTable extends Migration
{
    public function up()
    {
        Schema::create('shifts', function (Blueprint $table) {
            $table->integer('shift_id')->autoIncrement();
            $table->foreignId('employee_id')->nullable()->constrained('employees')->onDelete('cascade');
            $table->string('shift_name', 50)->nullable();
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('shifts');
    }
}