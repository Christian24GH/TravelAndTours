<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
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
            'uuid'      => Str::uuid(),
            'email'     => 'fleetManager@gmail.com',
            'password'  => '123456',
            'role'      => 'LogisticsII Admin',
        ]);

        User::factory()->create([
            'name'      => 'Driver Pipito',
            'uuid'      => Str::uuid(),
            'email'     => 'driver@gmail.com',
            'password'  => '123456',
            'role'      => 'Driver',
        ]);

        User::factory()->create([
            'name'      => 'Rence',
            'uuid'      => Str::uuid(),
            'email'     => 'rence@gmail.com',
            'password'  => '123456',
            'role'      => 'LogisticI Admin',
        ]);
    }
}
