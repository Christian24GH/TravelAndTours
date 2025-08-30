<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProjectLogisticTrackerController extends Controller
{
    // ================================
    // Level 2 – Equipment Scheduling
    // ================================

    // 3.1.1 Assign Equipment to Tour
    public function assignEquipmentToTour(Request $request)
    {
        $data = $request->validate([
            'equipment_id' => 'required|exists:equipment,equipment_id',
            'project_id' => 'required|exists:tour_project,project_id',
            'scheduled_date' => 'required|date',
            'scheduled_time' => 'required|time',
        ]);

        // Insert equipment schedule assignment
        $scheduleId = DB::table('equipment_schedule')->insertGetId([
            'equipment_id' => $data['equipment_id'],
            'project_id' => $data['project_id'],
            'scheduled_date' => $data['scheduled_date'],
            'scheduled_time' => $data['scheduled_time'],
            'approved' => false,  // Not approved yet
        ]);

        return response()->json(['message' => 'Equipment assigned to tour successfully', 'schedule_id' => $scheduleId]);
    }

    // 3.1.2 Set Date & Time of Use
    public function setDateAndTimeOfUse(Request $request, $scheduleId)
    {
        $data = $request->validate([
            'scheduled_date' => 'required|date',
            'scheduled_time' => 'required|time',
        ]);

        // Update the equipment schedule with new date/time
        DB::table('equipment_schedule')
            ->where('schedule_id', $scheduleId)
            ->update([
                'scheduled_date' => $data['scheduled_date'],
                'scheduled_time' => $data['scheduled_time']
            ]);

        return response()->json(['message' => 'Scheduled date and time updated successfully']);
    }

    // 3.1.3 Approve Schedule
    public function approveSchedule($scheduleId)
    {
        DB::table('equipment_schedule')
            ->where('schedule_id', $scheduleId)
            ->update(['approved' => true]);

        return response()->json(['message' => 'Equipment schedule approved successfully']);
    }

    // ================================
    // Level 2 – Delivery & Transport Tracking
    // ================================

    // 3.2.1 Assign Vehicle for Equipment Delivery
    public function assignVehicleForDelivery(Request $request)
    {
        $data = $request->validate([
            'schedule_id' => 'required|exists:equipment_schedule,schedule_id',
            'vehicle_id' => 'required|exists:fleet_vehicle,vehicle_id', // assuming fleet_vehicle table exists
            'driver_name' => 'nullable|string|max:100',
        ]);

        // Insert vehicle and driver assignment to the delivery
        $deliveryId = DB::table('delivery')->insertGetId([
            'schedule_id' => $data['schedule_id'],
            'vehicle_id' => $data['vehicle_id'],
            'driver_name' => $data['driver_name']
        ]);

        return response()->json(['message' => 'Vehicle assigned for delivery', 'delivery_id' => $deliveryId]);
    }

    // 3.2.2 Record Driver Details
    public function recordDriverDetails(Request $request, $deliveryId)
    {
        $data = $request->validate([
            'driver_name' => 'required|string|max:100',
            'license_number' => 'nullable|string|max:50',
            'contact_info' => 'nullable|string|max:100',
        ]);

        // Update driver details for the delivery
        DB::table('delivery')
            ->where('delivery_id', $deliveryId)
            ->update([
                'driver_name' => $data['driver_name'],
                'license_number' => $data['license_number'],
                'contact_info' => $data['contact_info']
            ]);

        return response()->json(['message' => 'Driver details recorded successfully']);
    }

    // 3.2.3 Mark as Delivered
    public function markAsDelivered($deliveryId)
    {
        DB::table('delivery')
            ->where('delivery_id', $deliveryId)
            ->update(['status' => 'delivered', 'delivered_at' => now()]);

        return response()->json(['message' => 'Delivery marked as delivered']);
    }

    // ================================
    // Level 2 – Tour Reports
    // ================================

    // 3.3.1 Usage Summary per Trip
    public function usageSummaryPerTrip($tourProjectId)
    {
        // Fetch equipment usage for the given tour project
        $usageSummary = DB::table('equipment_schedule')
            ->join('equipment', 'equipment_schedule.equipment_id', '=', 'equipment.equipment_id')
            ->where('equipment_schedule.project_id', $tourProjectId)
            ->select('equipment.name', 'equipment_schedule.scheduled_date', 'equipment_schedule.scheduled_time')
            ->get();

        return response()->json(['usage_summary' => $usageSummary]);
    }

    // 3.3.2 Transport Efficiency Report
    public function transportEfficiencyReport($tourProjectId)
    {
        // Placeholder logic to generate transport efficiency report (e.g., vehicles used, time taken)
        $efficiencyReport = DB::table('delivery')
            ->join('equipment_schedule', 'delivery.schedule_id', '=', 'equipment_schedule.schedule_id')
            ->where('equipment_schedule.project_id', $tourProjectId)
            ->select('delivery.vehicle_id', 'delivery.status', 'delivery.delivered_at')
            ->get();

        return response()->json(['efficiency_report' => $efficiencyReport]);
    }

    // 3.3.3 Delays and Issues Report
    public function delaysAndIssuesReport($tourProjectId)
    {
        // Placeholder for delays/issues report logic
        $delaysAndIssues = DB::table('delivery')
            ->whereNotNull('issues_notes')  // Find deliveries with issues
            ->where('status', '!=', 'delivered')
            ->select('delivery.schedule_id', 'delivery.issues_notes', 'delivery.status')
            ->get();

        return response()->json(['delays_and_issues_report' => $delaysAndIssues]);
    }
}
