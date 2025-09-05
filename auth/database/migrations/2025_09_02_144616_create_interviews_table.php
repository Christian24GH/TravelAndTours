<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
{
    Schema::create('interviews', function (Blueprint $table) {
        $table->id();
        $table->string('applicant');   // or make this a foreign key to applicants
        $table->date('date');
        $table->string('status')->default('Pending');
        $table->timestamps();
    });
}


    public function down(): void
    {
        Schema::dropIfExists('interviews');
    }
};
