<?php

namespace Tests\Feature;

use App\Services\MapboxService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class ReservationDetailsTest extends TestCase
{
    use RefreshDatabase;


    public function it_creates_a_reservation_successfully()
    {
        $this->artisan('db:seed');

        $vehicleId = DB::table('vehicles')->value('id');
        
        $this->mock(MapboxService::class, function ($mock) {
            $mock->shouldReceive('getRoute')->andReturn([
                'distance' => 10000,   // 10km
                'duration' => 600,     // 10min
                'geometry' => ['type' => 'LineString', 'coordinates' => []],
            ]);
        });

        $payload = [
            'purpose' => 'Business Trip',
            'requestor_uuid' => (string) Str::uuid(),
            'start_dt' => '2025-09-15 08:00:00',
            'end_dt'   => '2025-09-15 12:00:00',
            'trip_plan' => [
                ['address_name' => 'Office', 'latitude' => 14.5995, 'longitude' => 120.9842],
                ['address_name' => 'Airport', 'latitude' => 14.508, 'longitude' => 121.019],
            ],
            'vehicle_ids' => [$vehicleId],
        ];

        $response = $this->postJson('/api/reserve/submit', $payload);

        $response->dump();

        $response->assertStatus(200)
                 ->assertJsonStructure(['success', 'batch_number']);

        $this->assertDatabaseHas('reservations', [
            'purpose' => 'Business Trip',
            'status' => 'Pending',
        ]);

        $this->assertDatabaseHas('vehicles', [
            'id' => $vehicleId,
            'status' => 'Reserved',
        ]);

        $this->assertDatabaseHas('trip_route', [
            'start_address' => 'Office',
            'end_address'   => 'Airport',
        ]);

        $this->assertDatabaseHas('trip_metrics', [
            'type' => 'Pretrip',
        ]);

        return $response->json('batch_number');
    }

    public function it_fails_validation_with_missing_fields()
    {
        
        $response = $this->postJson('/api/reserve/submit', []);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors([
                     'requestor_uuid',
                     'start_dt',
                     'end_dt',
                     'trip_plan',
                     'vehicle_ids',
                 ]);
    }

    /** 
     * 
     * 
     *  */
    public function it_returns_reservation_details()
    {
        $this->artisan('db:seed');

        $vehicleId = DB::table('vehicles')->limit(3)->pluck('id')->all();
        
        //dd($vehicleId);
        $this->mock(MapboxService::class, function ($mock) {
            $mock->shouldReceive('getRoute')->andReturn([
                'distance' => 10000,   // 10km
                'duration' => 600,     // 10min
                'geometry' => ['type' => 'LineString', 'coordinates' => []],
            ]);
        });

        $payload = [
            'purpose' => 'Business Trip',
            'requestor_uuid' => (string) Str::uuid(),
            'start_dt' => '2025-09-15 08:00:00',
            'end_dt'   => '2025-09-15 12:00:00',
            'trip_plan' => [
                ['address_name' => 'Office', 'latitude' => 14.5995, 'longitude' => 120.9842],
                ['address_name' => 'Airport', 'latitude' => 14.508, 'longitude' => 121.019],
            ],
            'vehicle_ids' => $vehicleId,
        ];

        $response = $this->postJson('/api/reserve/submit', $payload);

        //$response->dump();

        $response->assertStatus(200)
                 ->assertJsonStructure(['success', 'batch_number']);

        $this->assertDatabaseHas('reservations', [
            'purpose' => 'Business Trip',
            'status' => 'Pending',
        ]);

        $this->assertDatabaseHas('vehicles', [
            'id' => $vehicleId,
            'status' => 'Reserved',
        ]);

        $this->assertDatabaseHas('trip_route', [
            'start_address' => 'Office',
            'end_address'   => 'Airport',
        ]);

        $this->assertDatabaseHas('trip_metrics', [
            'type' => 'Pretrip',
        ]);

        $batchNumber = $response->json('batch_number');
        // Act: call the details endpoint
        $response = $this->postJson('/api/reserve/details', [
            'batch_number' => $batchNumber,
        ]);

        // Debug: print JSON response
        // This will dump the body in your console
        $response->dump();

        // Assert the response structure
        
        $response->assertStatus(200);
    }

    /**
     * @test
     */
    public function it_approves_reservations(){
        
        //make reservation
        $this->artisan('db:seed');

        $vehicleId = DB::table('vehicles')->limit(3)->pluck('id')->all();
        
        $this->mock(MapboxService::class, function ($mock) {
            $mock->shouldReceive('getRoute')->andReturn([
                'distance' => 10000,   // 10km
                'duration' => 600,     // 10min
                'geometry' => ['type' => 'LineString', 'coordinates' => []],
            ]);
        });

        $payload = [
            'purpose' => 'Business Trip',
            'requestor_uuid' => (string) Str::uuid(),
            'start_dt' => '2025-09-15 08:00:00',
            'end_dt'   => '2025-09-15 12:00:00',
            'trip_plan' => [
                ['address_name' => 'Office', 'latitude' => 14.5995, 'longitude' => 120.9842],
                ['address_name' => 'Airport', 'latitude' => 14.508, 'longitude' => 121.019],
            ],
            'vehicle_ids' => $vehicleId,
        ];

        $response = $this->postJson('/api/reserve/submit', $payload);

        $response->assertStatus(200)
                 ->assertJsonStructure(['success', 'batch_number']);

        $this->assertDatabaseHas('reservations', [
            'purpose' => 'Business Trip',
            'status' => 'Pending',
        ]);

        $this->assertDatabaseHas('vehicles', [
            'id' => $vehicleId,
            'status' => 'Reserved',
        ]);

        $this->assertDatabaseHas('trip_route', [
            'start_address' => 'Office',
            'end_address'   => 'Airport',
        ]);

        $this->assertDatabaseHas('trip_metrics', [
            'type' => 'Pretrip',
        ]);

        $driverUIDs = DB::table('drivers')->limit(3)->pluck('uuid')->all();
        $batchNumber = $response->json('batch_number');
        
        $assignments = [];

        $assignments = array_map(function ($driverUIDs, $vehicleId) {
            return [
                'driver_uuid' => $driverUIDs,
                'vehicle_id'  => $vehicleId,
            ];
        }, $driverUIDs, $vehicleId);

        //approve reservation
        $response = $this->putJson('/api/reserve/approve', [
            'batch_number' => $batchNumber,
            'assignments' => $assignments,
        ]);

        //dd($assignments);
        $response->dump();

        $response->assertStatus(200);
    }
}
