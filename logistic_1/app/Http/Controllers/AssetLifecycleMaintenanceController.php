<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class AssetLifecycleMaintenanceController extends Controller
{
    // Level 2 - Asset Registration & QR Tagging
    // 4.1.1 Generate QR for Equipment
    public function registerAsset(Request $request)
    {
        // Validate incoming request data
        $validated = $request->validate([
            'equipment_id' => 'required|exists:equipment,equipment_id',  // Ensure equipment exists in the database
            'asset_code' => 'required|unique:assets,asset_code', // Ensure unique asset code
            'assigned_project_id' => 'nullable|exists:tour_project,project_id', // Optional: Project assignment
            'description' => 'nullable|string|max:255',
        ]);

        // Generate unique QR token for asset
        $qr_token = Str::uuid(); // Generate a unique UUID as QR token

        // Insert new asset into the database using DB facade
        $assetId = DB::table('asset')->insertGetId([
            'equipment_id' => $validated['equipment_id'],
            'asset_code' => $validated['asset_code'],
            'qr_token' => $qr_token,
            'assigned_project_id' => $validated['assigned_project_id'],
            'description' => $validated['description'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Generate QR Code URL using the external QR code generator
        $assetUrl = url("/view?token=" . $qr_token); // Asset URL to be encoded in QR code
        $qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' . urlencode($assetUrl); // External QR code API

        // Return asset details and generated QR code URL
        return response()->json([
            'asset_id' => $assetId,
            'qr_token' => $qr_token,
            'qr_code_url' => $qrCodeUrl, // URL for the QR code image
        ], 201);
    }

    // 4.1.2 Scan to Retrieve Details (QR Code Scanning)
    public function getAssetByQR(Request $request)
    {
        // Validate the scanned QR token
        $validated = $request->validate([
            'qr_token' => 'required|exists:asset,qr_token', // Ensure the QR token exists in the assets table
        ]);

        // Retrieve the asset based on the QR token using DB query
        $asset = DB::table('asset')
            ->where('qr_token', $validated['qr_token'])
            ->first();

        return response()->json($asset);
    }

    // 4.1.3 Link to Tour or Project
    public function linkToProject($assetId, Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:tour_project,project_id', // Link the asset to a specific tour project
        ]);

        // Update the asset and link it to the project using DB query
        DB::table('asset')
            ->where('id', $assetId)
            ->update(['assigned_project_id' => $validated['project_id']]);

        return response()->json(['message' => 'Asset successfully linked to project.']);
    }

    // Level 2 - Predictive Maintenance (Rule-based AI)
    // 4.2.1 Record Usage History
    public function recordUsage($assetId, Request $request)
    {
        $validated = $request->validate([
            'usage_hours' => 'required|numeric|min:0',
            'mileage' => 'nullable|numeric|min:0',
            'usage_date' => 'required|date',
        ]);

        // Insert usage data for the asset
        DB::table('asset_usage')->insert([
            'asset_id' => $assetId,
            'usage_hours' => $validated['usage_hours'],
            'mileage' => $validated['mileage'] ?? 0, // For non-vehicle assets, mileage can be null
            'usage_date' => $validated['usage_date'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Usage history recorded successfully.']);
    }

    // 4.2.2 Maintenance Alerts
    public function checkForMaintenanceAlerts($assetId)
    {
        // Get the latest usage data for the asset using DB query
        $latestUsage = DB::table('asset_usage')
            ->where('asset_id', $assetId)
            ->latest()
            ->first();

        // Set a usage threshold for maintenance alerts
        $usageThreshold = 500; // Example threshold in usage hours

        if ($latestUsage && $latestUsage->usage_hours > $usageThreshold) {
            // Create a maintenance alert if usage exceeds the threshold
            DB::table('maintenance_alert')->insert([
                'asset_id' => $assetId,
                'alert_type' => 'usage_limit',
                'alert_message' => 'Asset usage exceeds ' . $usageThreshold . ' hours.',
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json(['message' => 'Maintenance alert created.']);
        }

        return response()->json(['message' => 'No maintenance required.']);
    }

    // 4.2.3 Suggest Replacement/Repair
    public function suggestReplacement($assetId)
    {
        // Check maintenance history to suggest replacement using DB query
        $repairCount = DB::table('maintenance')
            ->where('asset_id', $assetId)
            ->whereIn('maintenance_type', ['repair', 'replacement'])
            ->count();

        if ($repairCount > 3) {
            return response()->json(['suggestion' => 'Replace asset due to frequent repairs.']);
        }

        return response()->json(['suggestion' => 'Asset is still in good condition.']);
    }

    // Level 2 - Maintenance History
    // 4.3.1 Log Repair Date & Details
    public function logRepair($assetId, Request $request)
    {
        $validated = $request->validate([
            'maintenance_type' => 'required|in:repair,replacement,checkup', // Type of maintenance
            'maintenance_date' => 'required|date',
            'cost' => 'nullable|numeric',
            'notes' => 'nullable|string',
        ]);

        // Insert maintenance data using DB query
        DB::table('maintenance')->insert([
            'asset_id' => $assetId,
            'maintenance_type' => $validated['maintenance_type'],
            'maintenance_date' => $validated['maintenance_date'],
            'cost' => $validated['cost'],
            'notes' => $validated['notes'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Maintenance details saved successfully.']);
    }

    // 4.3.2 Track Cost of Repairs
    public function trackRepairCost($assetId)
    {
        // Calculate the total cost of repairs for the asset using DB query
        $repairCosts = DB::table('maintenance')
            ->where('asset_id', $assetId)
            ->sum('cost'); // Sum of all repair costs for the asset

        return response()->json(['total_repair_cost' => $repairCosts]);
    }

    // 4.3.3 Generate Maintenance Report
    public function generateMaintenanceReport($assetId)
    {
        // Retrieve the asset's maintenance history using DB query
        $maintenanceHistory = DB::table('maintenance')
            ->where('asset_id', $assetId)
            ->get();

        return response()->json($maintenanceHistory);
    }
}
