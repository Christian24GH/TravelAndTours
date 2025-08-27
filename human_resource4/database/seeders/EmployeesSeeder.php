<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EmployeesSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Get jobs from DB
        $jobs = DB::table('jobs')->get();

        if ($jobs->count() === 0) {
            $this->command->warn("⚠️ No jobs found in 'jobs' table. Please seed jobs first.");
            return;
        }

        $employees = [
            [
                'employee_code' => 'EMP001',
                'first_name' => 'Juan',
                'last_name' => 'Dela Cruz',
                'email' => 'juan.delacruz@example.com',
                'phone' => '09171234567',
                'date_of_birth' => '1990-05-10',
                'hire_date' => now(),
                'job_id' => $jobs[0]->id,
                'salary' => $jobs[0]->base_salary, // salary from jobs table
                'employment_type' => 'Regular',
                'status' => 'active',
                'address' => 'Quezon City, Philippines',
                'emergency_contact' => 'Maria Dela Cruz',
                'emergency_phone' => '09181112222',
            ],
            [
                'employee_code' => 'EMP002',
                'first_name' => 'Ana',
                'last_name' => 'Santos',
                'email' => 'ana.santos@example.com',
                'phone' => '09182345678',
                'date_of_birth' => '1992-07-20',
                'hire_date' => now(),
                'job_id' => $jobs[1]->id ?? $jobs[0]->id,
                'salary' => $jobs[1]->base_salary ?? $jobs[0]->base_salary,
                'employment_type' => 'Contract',
                'status' => 'active',
                'address' => 'Makati City, Philippines',
                'emergency_contact' => 'Jose Santos',
                'emergency_phone' => '09189998888',
            ],
            [
                'employee_code' => 'EMP003',
                'first_name' => 'Michael',
                'last_name' => 'Reyes',
                'email' => 'michael.reyes@example.com',
                'phone' => '09183456789',
                'date_of_birth' => '1988-03-15',
                'hire_date' => now(),
                'job_id' => $jobs[2]->id ?? $jobs[0]->id,
                'salary' => $jobs[2]->base_salary ?? $jobs[0]->base_salary,
                'employment_type' => 'Regular',
                'status' => 'active',
                'address' => 'Cebu City, Philippines',
                'emergency_contact' => 'Anna Reyes',
                'emergency_phone' => '09186667777',
            ],
            [
                'employee_code' => 'EMP004',
                'first_name' => 'Sarah',
                'last_name' => 'Lopez',
                'email' => 'sarah.lopez@example.com',
                'phone' => '09184567890',
                'date_of_birth' => '1995-09-25',
                'hire_date' => now(),
                'job_id' => $jobs[3]->id ?? $jobs[0]->id,
                'salary' => $jobs[3]->base_salary ?? $jobs[0]->base_salary,
                'employment_type' => 'Trainee',
                'status' => 'active',
                'address' => 'Davao City, Philippines',
                'emergency_contact' => 'Pedro Lopez',
                'emergency_phone' => '09187776666',
            ],
            [
                'employee_code' => 'EMP005',
                'first_name' => 'Robert',
                'last_name' => 'Garcia',
                'email' => 'robert.garcia@example.com',
                'phone' => '09185678901',
                'date_of_birth' => '1991-12-30',
                'hire_date' => now(),
                'job_id' => $jobs[4]->id ?? $jobs[0]->id,
                'salary' => $jobs[4]->base_salary ?? $jobs[0]->base_salary,
                'employment_type' => 'Regular',
                'status' => 'active',
                'address' => 'Iloilo City, Philippines',
                'emergency_contact' => 'Carmen Garcia',
                'emergency_phone' => '09185554444',
            ],
        ];

        DB::table('employees')->insert($employees);
    }
}
