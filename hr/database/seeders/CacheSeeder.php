<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CacheSeeder extends Seeder
{
    public function run()
    {
        DB::table('cache')->insert([
            ['key' => 'config_cache', 'value' => 'serialized_config_data', 'expiration' => 3600],
            ['key' => 'route_cache', 'value' => 'serialized_route_data', 'expiration' => 3600]
        ]);
    }
}