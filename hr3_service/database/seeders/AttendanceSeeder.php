<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AttendanceSeeder extends Seeder
{
    public function run()
    {
        DB::table('attendance')->insert([
            ['employee_id' => 1, 'clock_in' => '08:00:00', 'break_in' => '12:00:00', 'break_out' => '13:00:00', 'clock_out' => '17:00:00', 'date' => '2023-01-01'],
            ['employee_id' => 2, 'clock_in' => '08:05:00', 'break_in' => '12:05:00', 'break_out' => '13:05:00', 'clock_out' => '17:05:00', 'date' => '2023-01-01']
        ]);
    }
}