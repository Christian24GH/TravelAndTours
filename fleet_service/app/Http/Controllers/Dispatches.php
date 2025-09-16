<?php

namespace App\Http\Controllers;

use App\Events\DispatchUpdates;
use App\Events\TrackingEvent;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use PDO;
use PhpParser\Node\Stmt\Catch_;
use Throwable;

class Dispatches extends Controller
{
    public function show(Request $request)
    {
        $q = $request->input('q');

        // Base query
        $query = DB::table('dispatch_orders as d')
            ->join('assignments as a', 'a.id', '=', 'd.assignment_id')
            ->join('reservations as r', 'r.id', '=', 'a.reservation_id')
            ->join('vehicles as v', 'v.id', '=', 'a.vehicle_id')
            ->leftJoin('drivers as dv', 'dv.uuid', '=', 'a.driver_uuid');

        // Search filter
        if ($q) {
            $query->where(function ($sub) use ($q) {
                $sub->where('d.uuid', 'like', "%{$q}%")
                    ->orWhere('a.driver_uuid', 'like', "%{$q}%")
                    ->orWhere('r.batch_number', 'like', "%{$q}%");
            });
        }

        // Select fields
        $dispatches = $query
            ->orderBy('r.batch_number')
            ->orderBy('d.created_at', 'desc')
            ->get([
                'd.id as dispatch_id',
                'd.uuid as dispatch_uuid',
                'd.status as dispatch_status',
                'r.batch_number',
                'v.status as vehicle_status',
                'v.id as vehicle_id',
                'v.type as vehicle_type',
                'dv.name as driver_name',
                'dv.status as driver_status',
            ]);

        // Group by batch_number
        $grouped = $dispatches->groupBy('batch_number')->map(function ($items, $batch) {
            return [
                'batch_number' => $batch,
                'reservations' => $items->map(function ($row) {
                    return [
                        'dispatch_id'     => $row->dispatch_id,
                        'dispatch_uuid'   => $row->dispatch_uuid,
                        'dispatch_status' => $row->dispatch_status,
                        'vehicle' => [
                            'type'     => $row->vehicle_type,
                            'status'   => $row->vehicle_status,
                        ],
                        'driver' => [
                            'name'   => $row->driver_name,
                            'status' => $row->driver_status,
                        ],
                    ];
                }),
            ];
        })->values();

        return response()->json(['dispatches' => $grouped], 200);
    }

    public function dispatchDetails(Request $request)
    {
        $request->validate([
            'batch_number' => ['required', 'exists:reservations,batch_number'],
        ]);

        try {
            $dispatches = DB::table('dispatch_orders as d')
                ->join('assignments as a', 'a.id', '=', 'd.assignment_id')
                ->join('reservations as r', 'r.id', '=', 'a.reservation_id')
                ->where('r.batch_number', $request['batch_number'])
                ->select([
                    'd.id as dispatch_id',
                    'd.uuid as dispatch_uuid',
                    'd.status as dispatch_status',
                    'd.scheduled_time',
                    'd.start_time',
                    'd.arrival_time',
                    'd.return_time',
                    'd.remarks',
                    'd.cancelled_at',
                    'd.closed_at',
                    'a.id as assignment_id',
                    'r.id as reservation_id',
                    'r.purpose',
                    'r.status as reservation_status',
                    'r.start_date',
                    'r.end_date',
                ])
                ->get();

            if ($dispatches->isEmpty()) {
                return response()->json(['message' => 'No dispatch found'], 404);
            }

            $results = [];
            foreach ($dispatches as $dispatch) {
                $assignment = DB::table('assignments as a')
                    ->join('vehicles as v', 'v.id', '=', 'a.vehicle_id')
                    ->leftJoin('drivers as d', 'd.uuid', '=', 'a.driver_uuid')
                    ->where('a.id', $dispatch->assignment_id)
                    ->first([
                        'v.id as vehicle_id',
                        'v.plate_number',
                        'v.model',
                        'v.type',
                        'v.capacity',
                        'v.status as vehicle_status',
                        'd.uuid as driver_uuid',
                        'd.name as driver_name',
                        'd.status as driver_status',
                    ]);

                $results[] = [
                    'dispatch_id'     => $dispatch->dispatch_id,
                    'dispatch_uuid'   => $dispatch->dispatch_uuid,
                    'dispatch_status' => $dispatch->dispatch_status,
                    'scheduled_time'  => $dispatch->scheduled_time,
                    'start_time'      => $dispatch->start_time,
                    'arrival_time'    => $dispatch->arrival_time,
                    'return_time'     => $dispatch->return_time,
                    'remarks'         => $dispatch->remarks,
                    'cancelled_at'    => $dispatch->cancelled_at,
                    'closed_at'       => $dispatch->closed_at,
                    'assignment'      => $assignment,
                ];

                // store reservation_id once (same for all in this batch)
                $reservationId = $dispatch->reservation_id;
                $reservation   = [
                    'id'         => $dispatch->reservation_id,
                    'purpose'    => $dispatch->purpose,
                    'status'     => $dispatch->reservation_status,
                    'start_date' => $dispatch->start_date,
                    'end_date'   => $dispatch->end_date,
                ];
            }

            // Trip Routes & Metrics belong to the reservation
            $tripRoutes = DB::table('trip_routes')
                ->where('reservation_id', $reservationId)
                ->orderBy('sequence')
                ->get([
                    'id',
                    'uuid',
                    'start_address',
                    'start_latitude',
                    'start_longitude',
                    'end_address',
                    'end_latitude',
                    'end_longitude',
                    'sequence',
                ]);

            $tripMetrics = DB::table('trip_metrics as tm')
                ->join('trip_routes as tr', 'tr.id', '=', 'tm.trip_route_id')
                ->where('tr.reservation_id', $reservationId)
                ->select([
                    'tm.type',
                    'tm.distance',
                    'tm.duration',
                    'tm.geometry',
                ])
                ->get();
            
            $dispatchData['reservation'] = $reservation;
            $dispatchData['dispatch_orders'] = $results;
            $dispatchData['routes'] = $tripRoutes;
            $dispatchData['metrics'] = $tripMetrics;

            return response()->json($dispatchData, 200);

        } catch (Throwable $e) {
            return response()->json([
                'message' => 'Failed to find the requested record',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }



    public function showToDriver(Request $request)
    {
        $driver_uuid = $request->input('driver_uuid');
        $dispatch_id = $request->input('dispatch_id');

        try {
            $query = DB::table('dispatch_orders as d')
                ->join('assignments as a', 'a.id', '=', 'd.assignment_id')
                ->join('reservations as r', 'r.id', '=', 'a.reservation_id')
                ->join('vehicles as v', 'v.id', '=', 'a.vehicle_id')
                ->join('drivers as dr', 'dr.uuid', '=', 'a.driver_uuid')
                ->select([
                    'd.id as dispatch_id',
                    'd.uuid as dispatch_uuid',
                    'd.status as dispatch_status',
                    'd.scheduled_time',
                    'd.start_time',
                    'd.return_time',
                    'r.id as reservation_id',
                    'r.batch_number',
                    'r.requestor_uuid', // TODO: replace with actual requester name
                    'r.purpose',
                    'r.pickup',
                    'r.dropoff',
                    'v.id as vehicle_id',
                    'v.plate_number',
                    'v.type',
                    'v.model',
                    'dr.uuid as driver_uuid',
                    'dr.name as driver_name',
                ])
                ->orderBy('d.status', 'asc')
                ->orderBy('d.created_at', 'desc');

            if ($dispatch_id) {
                $dispatch = $query->where('d.id', $dispatch_id)->first();
                return response()->json(['dispatches' => $dispatch], 200);
            }

            if ($driver_uuid) {
                $dispatches = $query->where('a.driver_uuid', $driver_uuid)->get();
                return response()->json(['dispatches' => $dispatches], 200);
            }

            // If no filters, default to empty (or admin all if needed)
            return response()->json(['dispatches' => []], 200);

        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    private function triggerStartTrip($batchNumber)
    {
        // Check if all dispatch orders under the batch are acknowledged
        $allAcknowledged = !DB::table('dispatch_orders as d')
            ->join('assignments as a', 'a.id', '=', 'd.assignment_id')
            ->join('reservations as r', 'r.id', '=', 'a.reservation_id')
            ->where('r.batch_number', $batchNumber)
            ->whereNull('d.acknowledged_at')
            ->exists();

        if (!$allAcknowledged) {
            return false; // not ready yet
        }

        // Update all dispatch orders in that batch to "Dispatched"
        DB::table('dispatch_orders as d')
            ->join('assignments as a', 'a.id', '=', 'd.assignment_id')
            ->join('reservations as r', 'r.id', '=', 'a.reservation_id')
            ->where('r.batch_number', $batchNumber)
            ->update([
                'd.status'        => 'Dispatched',
                'd.start_time'    => now(),
                'd.dispatched_at' => now(),
            ]);

        return true;
    }

    public function driverAcknowledgement(Request $request)
    {
        $validated = $request->validate([
            'dispatch_uuid' => ['required', 'exists:dispatch_orders,uuid'],
            'driver_uuid'   => ['required'],
        ]);

        try {
            DB::transaction(function () use ($validated) {
                $dispatch = DB::table('dispatch_orders as d')
                    ->join('assignments as a', 'a.id', '=', 'd.assignment_id')
                    ->join('reservations as r', 'r.id', '=', 'a.reservation_id')
                    ->where('d.uuid', $validated['dispatch_uuid'])
                    ->where('a.driver_uuid', $validated['driver_uuid'])
                    ->select('d.id', 'r.batch_number')
                    ->first();

                if (!$dispatch) {
                    throw new \Exception('Dispatch not found for this driver.');
                }

                DB::table('dispatch_orders')
                    ->where('id', $dispatch->id)
                    ->update([
                        'status'          => 'Preparing',
                        'acknowledged_at' => now(),
                    ]);

                // auto trigger if last acknowledgement
                $started = $this->triggerStartTrip($dispatch->batch_number);
                if ($started) {
                    // optional: log or notify dispatcher
                    Log::info("Trip auto-started for batch {$dispatch->batch_number}");
                }
            });

            return response()->json('Dispatch Accepted', 200);
        } catch (Exception $e) {
            Log::error('Failed to send acknowledgement!', [$e->getMessage()]);
            return response()->json('Failed to send acknowledgement!', 500);
        }
    }

    public function startTrip(Request $request, $dispatchId)
    {
        try {
            $dispatch = DB::table('dispatch_orders as d')
                ->join('assignments as a', 'a.id', '=', 'd.assignment_id')
                ->join('reservations as r', 'r.id', '=', 'a.reservation_id')
                ->where('d.id', $dispatchId)
                ->select('r.batch_number')
                ->first();

            if (!$dispatch) {
                return response()->json(['message' => 'Dispatch not found'], 404);
            }

            $started = $this->triggerStartTrip($dispatch->batch_number);

            if (!$started) {
                return response()->json(['message' => 'Waiting for drivers'], 400);
            }

            return response()->json(['message' => 'Trip started successfully']);
        } catch (Exception $e) {
            Log::error(['error' => $e->getMessage()]);
            return response()->json(['message' => 'Server Error'], 500);
        }
    }


    /**TODO
     * IMPLEMENT: UPDATE FUNCTIONS
     * LIVE DRIVER POSITION MONITORING
     */

    

    public function trackLocation(Request $request)
    {
        $data = $request->validate([
            'dispatch_id' => 'required|integer|exists:dispatches,id',
            'latitude'    => 'required|numeric|between:-90,90',
            'longitude'   => 'required|numeric|between:-180,180',
            'speed'       => 'nullable|numeric',
            'heading'     => 'nullable|numeric',
            'recorded_at' => 'nullable|date',
        ]);

        $location = DB::table('dispatch_locations')->insertGetId([
            'dispatch_id' => $data['dispatch_id'],
            'latitude'    => $data['latitude'],
            'longitude'   => $data['longitude'],
            'speed'       => $data['speed'] ?? null,
            'heading'     => $data['heading'] ?? null,
            'recorded_at' => $data['recorded_at'] ?? Carbon::now(),
            'created_at'  => Carbon::now(),
            'updated_at'  => Carbon::now(),
        ]);

        $saved = DB::table('dispatch_locations')->find($location);

        // Broadcast location update (non-fatal if broadcasting not configured)
        if (class_exists(TrackingEvent::class)) {
            try {
                broadcast(new TrackingEvent($saved));
            } catch (\Throwable $e) {
                // log or silently ignore
            }
        }

        return response()->json([
            'message'  => 'Location tracked successfully',
            'location' => $saved,
        ], 201);
    }
}
