<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTimesheetsTable extends Migration
{
    public function up()
    {
        Schema::create('timesheets', function (Blueprint $table) {
            $table->integer('timesheet_id')->autoIncrement();
            $table->foreignId('employee_id')->nullable()->constrained('employees')->onDelete('cascade');
            $table->date('work_date')->nullable();
            $table->decimal('total_hours', 5, 2)->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('timesheets');
    }
}