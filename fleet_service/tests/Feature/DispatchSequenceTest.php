<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class DriverAcknowledgementTest extends TestCase
{
    use RefreshDatabase;

    /** */
    public function it_allows_driver_to_acknowledge_dispatch()
    {
        // 1. Insert a fake driver assignment
        $driverUuid = (string) Str::uuid();
        $assignmentId = DB::table('assignments')->insertGetId([
            'vehicle_id'  => 1, // assume vehicles seeded
            'driver_uuid' => $driverUuid,
            'reservation_id' => 1,
        ]);

        // 2. Insert a dispatch tied to that assignment
        $dispatchUuid = (string) Str::uuid();
        $dispatchId = DB::table('dispatches')->insertGetId([
            'uuid'          => $dispatchUuid,
            'assignment_id' => $assignmentId,
            'status'        => 'Pending',
        ]);

        // 3. Call the API
        $response = $this->postJson('/api/driver/acknowledge', [
            'dispatch_uuid' => $dispatchUuid,
            'driver_uuid'   => $driverUuid,
        ]);

        // Debugging dump if needed
        // $response->dump();

        // 4. Assert
        $response->assertStatus(200);

        $this->assertDatabaseHas('dispatches', [
            'id'            => $dispatchId,
            'status'        => 'Preparing',
        ]);
    }

    /** @test */
    public function it_fails_if_driver_does_not_match_dispatch()
    {
        $dispatchUuid = (string) Str::uuid();

        // Dispatch without assignment
        DB::table('dispatches')->insert([
            'uuid'          => $dispatchUuid,
            'assignment_id' => 9999, // fake
            'status'        => 'Pending',
        ]);

        $response = $this->postJson('/api/driver/acknowledge', [
            'dispatch_uuid' => $dispatchUuid,
            'driver_uuid'   => (string) Str::uuid(),
        ]);

        $response->assertStatus(500); // your code throws Exception
    }
}
