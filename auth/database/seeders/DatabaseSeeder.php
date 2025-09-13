<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {

    $this->call(HR2Seeder::class);
        User::factory()->create([
            'name'      => 'Fleet Manager',
            'email'     => 'fleetManager@gmail.com',
            'password'  => '123456',
            'role'      => 'LogisticsII Admin',
        ]);
    }
}
