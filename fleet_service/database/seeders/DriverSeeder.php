<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DriverSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $drivers = [];

        $names = [
            'John Doe', 'Michael Smith', 'Robert Johnson', 'James Williams', 'David Brown',
            'William Jones', 'Richard Miller', 'Joseph Davis', 'Thomas Wilson', 'Charles Taylor',
            'Christopher Moore', 'Daniel Anderson', 'Matthew Thomas', 'Anthony Jackson', 'Mark White',
            'Donald Harris', 'Steven Martin', 'Paul Thompson', 'Andrew Garcia', 'Joshua Martinez',
            'Kenneth Robinson', 'Kevin Clark', 'Brian Rodriguez', 'George Lewis', 'Timothy Lee',
            'Ronald Walker', 'Edward Hall', 'Jason Allen', 'Jeffrey Young', 'Ryan King'
        ];

        foreach ($names as $name) {
            $drivers[] = [
                'uuid' => (string) Str::uuid(),
                'name' => $name,
                'status' => 'Available',
            ];
        }

        DB::table('drivers')->insert($drivers);
    }
}
