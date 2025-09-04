<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EmployeeSeeder extends Seeder
{
    public function run()
    {
        DB::table('employees')->insert([
            [
                'full_name' => 'John Doe',
                'position' => 'Software Engineer',
                'department' => 'IT',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'full_name' => 'Jane Smith',
                'position' => 'HR Manager',
                'department' => 'HR',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'full_name' => 'Alice Johnson',
                'position' => 'Logistics Coordinator',
                'department' => 'Logistics',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}