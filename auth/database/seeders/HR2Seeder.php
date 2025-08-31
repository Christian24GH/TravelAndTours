<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class HR2Seeder extends Seeder
{
    public function run()
    {
        DB::table('roles')->insert([
            ['role_name' => 'Manager', 'succession_plan_status' => 'Active', 'created_at' => now(), 'updated_at' => now()],
            ['role_name' => 'Supervisor', 'succession_plan_status' => 'Active', 'created_at' => now(), 'updated_at' => now()],
            ['role_name' => 'Staff', 'succession_plan_status' => 'Inactive', 'created_at' => now(), 'updated_at' => now()],
        ]);

        DB::table('employees')->insert([
            [
                'first_name' => 'John',
                'middle_name' => 'A.',
                'last_name' => 'Doe',
                'suffix' => null,
                'department' => 'HR',
                'position' => 'Manager',
                'email' => 'john.doe@example.com',
                'phone' => '1234567890',
                'address' => '123 Main St',
                'birthday' => '1980-01-01',
                'civil_status' => 'Single',
                'emergency_contact' => 'Jane Doe',
                'hire_date' => '2010-06-01',
                'manager' => null,
                'employee_status' => 'Active',
                'profile_photo_url' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'first_name' => 'Alice',
                'middle_name' => null,
                'last_name' => 'Smith',
                'suffix' => null,
                'department' => 'IT',
                'position' => 'Supervisor',
                'email' => 'alice.smith@example.com',
                'phone' => '0987654321',
                'address' => '456 Elm St',
                'birthday' => '1990-05-15',
                'civil_status' => 'Married',
                'emergency_contact' => 'Bob Smith',
                'hire_date' => '2015-09-15',
                'manager' => 'John Doe',
                'employee_status' => 'Active',
                'profile_photo_url' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        DB::table('users')->insert([
            [
                'name' => 'John Doe',
                'email' => 'john.doe@example.com',
                'password' => Hash::make('password'),
                'employee_id' => 1,
                'email_verified_at' => now(),
                'remember_token' => Str::random(10),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Alice Smith',
                'email' => 'alice.smith@example.com',
                'password' => Hash::make('password'),
                'employee_id' => 2,
                'email_verified_at' => now(),
                'remember_token' => Str::random(10),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        
        DB::table('competencies')->insert([
            ['competency_name' => 'Leadership', 'competency_type' => 'Core', 'role_id' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['competency_name' => 'Technical Skills', 'competency_type' => 'Technical', 'role_id' => 2, 'created_at' => now(), 'updated_at' => now()],
        ]);

        
        DB::table('employee_competencies')->insert([
            ['employee_id' => 1, 'competency_id' => 1, 'competency_level' => 5, 'last_assessed_date' => '2025-01-01'],
            ['employee_id' => 2, 'competency_id' => 2, 'competency_level' => 4, 'last_assessed_date' => '2025-01-01'],
        ]);

        
        DB::table('learning_courses')->insert([
            ['course_name' => 'HR Management', 'course_type' => 'Online', 'duration' => '3 months', 'skills_covered' => 'Leadership', 'created_at' => now(), 'updated_at' => now()],
            ['course_name' => 'Advanced IT', 'course_type' => 'Workshop', 'duration' => '2 weeks', 'skills_covered' => 'Technical Skills', 'created_at' => now(), 'updated_at' => now()],
        ]);

        
        DB::table('employee_learning')->insert([
            ['employee_id' => 1, 'course_id' => 1, 'status' => 'Completed', 'completion_date' => '2025-06-01'],
            ['employee_id' => 2, 'course_id' => 2, 'status' => 'In Progress', 'completion_date' => null],
        ]);

        
        DB::table('training_programs')->insert([
            ['program_name' => 'Leadership Bootcamp', 'provider' => 'ABC Training', 'duration' => '1 week', 'target_skills' => 'Leadership', 'created_at' => now(), 'updated_at' => now()],
            ['program_name' => 'IT Security', 'provider' => 'XYZ Institute', 'duration' => '2 days', 'target_skills' => 'Technical Skills', 'created_at' => now(), 'updated_at' => now()],
        ]);

        
        DB::table('employee_training')->insert([
            ['employee_id' => 1, 'training_program_id' => 1, 'status' => 'Completed', 'feedback_score' => 5],
            ['employee_id' => 2, 'training_program_id' => 2, 'status' => 'Enrolled', 'feedback_score' => null],
        ]);

        
        DB::table('succession_plans')->insert([
            ['role_id' => 1, 'employee_id' => 1, 'readiness_level' => 'Ready', 'development_plan' => 'Mentorship', 'timeline_for_readiness' => '2025-12', 'created_at' => now(), 'updated_at' => now()],
            ['role_id' => 2, 'employee_id' => 2, 'readiness_level' => 'Developing', 'development_plan' => 'Training', 'timeline_for_readiness' => '2026-06', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
