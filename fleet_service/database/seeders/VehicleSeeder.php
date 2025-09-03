<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class VehicleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $makesAndModels = [
            ['Toyota', 'Vios', 'Sedan'],
            ['Toyota', 'Fortuner', 'SUV'],
            ['Honda', 'Civic', 'Sedan'],
            ['Honda', 'CR-V', 'SUV'],
            ['Ford', 'Ranger', 'Truck'],
            ['Ford', 'Everest', 'SUV'],
            ['Mitsubishi', 'Mirage', 'Hatchback'],
            ['Mitsubishi', 'Montero Sport', 'SUV'],
            ['Nissan', 'Navara', 'Truck'],
            ['Nissan', 'Terra', 'SUV'],
        ];

        $statuses = ['Available', 'Reserved', 'Under Maintenance', 'Retired'];

        $vehicles = [];

        for ($i = 1; $i <= 30; $i++) {
            $makeModel = $makesAndModels[array_rand($makesAndModels)];

            $vehicles[] = [
                'vin' => strtoupper(Str::random(17)),
                'plate_number' => Str::random(4). '- ' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'make' => $makeModel[0],
                'model' => $makeModel[1],
                'year' => rand(2015, 2023),
                'type' => $makeModel[2],
                'capacity' => rand(4, 15),
                'acquisition_date' => now()->subYears(rand(0, 8))->format('Y-m-d'),
                'status' => $statuses[array_rand($statuses)],
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('vehicles')->insert($vehicles);
    }
}
