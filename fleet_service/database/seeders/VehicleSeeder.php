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
            ['Toyota', 'Vios', 'Sedan', 1200, 5, 7.2],
            ['Toyota', 'Fortuner', 'SUV', 2500, 7, 8],
            ['Honda', 'Civic', 'Sedan', 1300, 5, 5],
            ['Honda', 'CR-V', 'SUV', 2000, 7, 7.2],
            ['Ford', 'Ranger', 'Truck', 3000, 5, 6],
            ['Ford', 'Everest', 'SUV', 2400, 7, 7.2],
            ['Mitsubishi', 'Mirage', 'Hatchback', 900, 5, 10],
            ['Mitsubishi', 'Montero Sport', 'SUV', 2500, 7, 7.2],
            ['Nissan', 'Navara', 'Truck', 2800, 5, 7.2],
            ['Nissan', 'Terra', 'SUV', 2400, 7, 7.2],
        ];

        $statuses = ['Available', 'Reserved', 'Under Maintenance', 'Retired'];

        $vehicles = [];

        for ($i = 1; $i <= 30; $i++) {
            $makeModel = $makesAndModels[array_rand($makesAndModels)];

            $vehicles[] = [
                'vin'              => strtoupper(Str::random(17)),
                'plate_number'     => Str::upper(Str::random(3)) . '-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'make'             => $makeModel[0],
                'model'            => $makeModel[1],
                'year'             => rand(2015, 2023),
                'type'             => $makeModel[2],
                'capacity'         => $makeModel[3], // kg
                'seats'            => $makeModel[4],
                'fuel_efficiency'  => $makeModel[5], // liters per km
                'acquisition_date' => now()->subYears(rand(0, 8))->format('Y-m-d'),
                'status'           => $statuses[array_rand($statuses)],
                'image_path'       => 'vehicles/default.webp',
                'created_at'       => now(),
                'updated_at'       => now(),
            ];
        }

        DB::table('vehicles')->insert($vehicles);

    }
}
