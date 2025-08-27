<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class JobsSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $jobs = [
            // HR Department
            [
                'title' => 'HR Manager',
                'department' => 'HR',
                'description' => 'Oversees HR operations, manages HR team and policies.',
                'base_salary' => 60000, // monthly
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Recruitment Specialist',
                'department' => 'HR',
                'description' => 'Handles recruitment, hiring, and onboarding.',
                'base_salary' => 40000,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'HR Assistant',
                'department' => 'HR',
                'description' => 'Supports HR team in administrative tasks.',
                'base_salary' => 25000,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Core Transaction Department
            [
                'title' => 'Core Transaction Manager',
                'department' => 'CORE TRANSACTION',
                'description' => 'Manages core transaction operations and team.',
                'base_salary' => 65000,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Transaction Analyst',
                'department' => 'CORE TRANSACTION',
                'description' => 'Analyzes and monitors core transaction processes.',
                'base_salary' => 45000,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Transaction Officer',
                'department' => 'CORE TRANSACTION',
                'description' => 'Handles day-to-day transaction operations.',
                'base_salary' => 35000,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Administrative Department
            [
                'title' => 'Administrative Manager',
                'department' => 'ADMINISTRATIVE',
                'description' => 'Leads administrative staff and operations.',
                'base_salary' => 55000,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Office Administrator',
                'department' => 'ADMINISTRATIVE',
                'description' => 'Maintains office operations and logistics.',
                'base_salary' => 30000,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Administrative Assistant',
                'department' => 'ADMINISTRATIVE',
                'description' => 'Supports admin team in day-to-day tasks.',
                'base_salary' => 20000,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Finance Department
            [
                'title' => 'Finance Manager',
                'department' => 'FINANCE',
                'description' => 'Oversees financial operations and reporting.',
                'base_salary' => 70000,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Accountant',
                'department' => 'FINANCE',
                'description' => 'Manages accounts, payroll, and budgets.',
                'base_salary' => 40000,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Financial Analyst',
                'department' => 'FINANCE',
                'description' => 'Analyzes financial performance and reports.',
                'base_salary' => 45000,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Logistic Department
            [
                'title' => 'Driver',
                'department' => 'LOGISTIC',
                'description' => 'Responsible for transporting clients in a timely manner.',
                'base_salary' => 15000,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Logistics Manager',
                'department' => 'LOGISTIC',
                'description' => 'Handle all the logistics transactions.',
                'base_salary' => 40000,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Logistics Coordinator',
                'department' => 'LOGISTIC',
                'description' => 'Coordinates shipments and deliveries.',
                'base_salary' => 30000,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Warehouse Officer',
                'department' => 'LOGISTIC',
                'description' => 'Handles inventory and warehouse tasks.',
                'base_salary' => 25000,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('jobs')->truncate();
        DB::table('jobs')->insert($jobs);
    }
}
