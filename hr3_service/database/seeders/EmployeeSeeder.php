<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EmployeeSeeder extends Seeder
{
    public function run()
    {
        DB::table('employees')->insert([
            ['id' => 1, 'full_name' => 'John Doe', 'position' => 'Developer', 'department' => 'IT', 'email' => 'john@example.com', 'phone' => '1234567890', 'hire_date' => now(), 'status' => 'active'],
            ['id' => 2, 'full_name' => 'Jane Smith', 'position' => 'Designer', 'department' => 'Creative', 'email' => 'jane@example.com', 'phone' => '0987654321', 'hire_date' => now(), 'status' => 'active']
        ]);
    }
}