<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name'      => 'Fleet Manager',
            'email'     => 'fleetManager@gmail.com',
            'password'  => '123456',
            'role'      => 'LogisticsII Admin',
        ]);

        User::factory()->create([
            'name'      => 'HR3 Manager',
            'email'     => 'hr@manager.com',
            'password'  => 'password',
            'role'      => 'HR3 Manager',
        ]);
    }
}
