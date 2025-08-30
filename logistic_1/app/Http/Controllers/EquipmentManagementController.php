<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EquipmentManagementController extends Controller
{
    // ================================
    // Equipment Management (CRUD)
    // ================================
    
    public function index()
    {
        return DB::table('equipment')
            ->leftJoin('equipment_category', 'equipment.category_id', '=', 'equipment_category.category_id')
            ->leftJoin('storage_location', 'equipment.storage_location_id', '=', 'storage_location.storage_location_id')
            ->select('equipment.*', 'equipment_category.category_name', 'storage_location.location_name')
            ->get();
    }

    public function show($id)
    {
        return DB::table('equipment')
            ->leftJoin('equipment_category', 'equipment.category_id', '=', 'equipment_category.category_id')
            ->leftJoin('storage_location', 'equipment.storage_location_id', '=', 'storage_location.storage_location_id')
            ->select('equipment.*', 'equipment_category.category_name', 'storage_location.location_name')
            ->where('equipment.equipment_id', $id)
            ->first();
    }

    public function storeEquipment(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'category_id' => 'nullable|exists:equipment_category,category_id',
            'stock_quantity' => 'integer|min:0',
            'storage_location_id' => 'nullable|exists:storage_location,storage_location_id',
            'status' => 'in:active,archived'
        ]);

        $id = DB::table('equipment')->insertGetId($data);

        return response()->json(DB::table('equipment')->where('equipment_id', $id)->first());
    }

    public function updateEquipment(Request $request, $id)
    {
        $data = $request->validate([
            'name' => 'sometimes|required|string|max:100',
            'description' => 'nullable|string',
            'category_id' => 'nullable|exists:equipment_category,category_id',
            'stock_quantity' => 'sometimes|integer|min:0',
            'storage_location_id' => 'nullable|exists:storage_location,storage_location_id',
            'status' => 'nullable|in:active,archived'
        ]);

        DB::table('equipment')->where('equipment_id', $id)->update($data);

        return response()->json(DB::table('equipment')->where('equipment_id', $id)->first());
    }

    public function archiveEquipment($id)
    {
        DB::table('equipment')->where('equipment_id', $id)->update(['status' => 'archived']);
        return response()->json(['message' => 'Equipment archived successfully']);
    }

    public function searchEquipment(Request $request)
    {
        $query = $request->input('q');
        return DB::table('equipment')
            ->leftJoin('equipment_category', 'equipment.category_id', '=', 'equipment_category.category_id')
            ->leftJoin('storage_location', 'equipment.storage_location_id', '=', 'storage_location.storage_location_id')
            ->select('equipment.*', 'equipment_category.category_name', 'storage_location.location_name')
            ->where('equipment.name', 'like', "%{$query}%")
            ->orWhere('equipment.description', 'like', "%{$query}%")
            ->get();
    }

    public function lowStockAlert()
    {
        $lowStockItems = DB::table('equipment')
            ->where('stock_quantity', '<', 5)
            ->get();

        return response()->json($lowStockItems);
    }

    public function overstockAlert()
    {
        $overstockItems = DB::table('equipment')
            ->where('stock_quantity', '>', 100)
            ->get();

        return response()->json($overstockItems);
    }

    public function categorizeEquipment($equipmentId, $categoryId)
    {
        DB::table('equipment')
            ->where('equipment_id', $equipmentId)
            ->update(['category_id' => $categoryId]);

        return response()->json(['message' => 'Equipment categorized successfully']);
    }

    public function updateStock(Request $request, $id)
    {
        $request->validate([
            'stock_quantity' => 'required|integer'
        ]);

        DB::table('equipment')
            ->where('equipment_id', $id)
            ->update(['stock_quantity' => $request->stock_quantity]);

        return response()->json(['message' => 'Stock quantity updated successfully']);
    }


    // ================================
    // Equipment Category Management
    // ================================

    public function indexCategory()
    {
        return DB::table('equipment_category')->get();
    }

    public function showCategory($id)
    {
        return DB::table('equipment_category')->where('category_id', $id)->first();
    }

    public function storeCategory(Request $request)
    {
        $data = $request->validate(['category_name' => 'required|string|max:100']);
        $id = DB::table('equipment_category')->insertGetId($data);
        return response()->json(DB::table('equipment_category')->where('category_id', $id)->first());
    }

    public function updateCategory(Request $request, $id)
    {
        $data = $request->validate(['category_name' => 'sometimes|required|string|max:100']);
        DB::table('equipment_category')->where('category_id', $id)->update($data);
        return response()->json(DB::table('equipment_category')->where('category_id', $id)->first());
    }

    public function archiveCategory($id)
    {
        DB::table('equipment_category')->where('category_id', $id)->update(['archived_at' => now()]);
        return response()->json(['message' => 'Category archived successfully']);
    }

    public function searchCategory(Request $request)
    {
        $q = $request->input('q');
        return DB::table('equipment_category')->where('category_name', 'like', "%{$q}%")->get();
    }

    // ================================
    // Storage Location Management
    // ================================

    public function indexStorage()
    {
        return DB::table('storage_location')->get();
    }

    public function showStorage($id)
    {
        return DB::table('storage_location')->where('storage_location_id', $id)->first();
    }

    public function storeStorage(Request $request)
    {
        $data = $request->validate([
            'location_name' => 'required|string|max:100',
            'description' => 'nullable|string'
        ]);
        $id = DB::table('storage_location')->insertGetId($data);
        return response()->json(DB::table('storage_location')->where('storage_location_id', $id)->first());
    }

    public function updateStorage(Request $request, $id)
    {
        $data = $request->validate([
            'location_name' => 'sometimes|required|string|max:100',
            'description' => 'nullable|string'
        ]);
        DB::table('storage_location')->where('storage_location_id', $id)->update($data);
        return response()->json(DB::table('storage_location')->where('storage_location_id', $id)->first());
    }

    public function archiveStorage($id)
    {
        DB::table('storage_location')->where('storage_location_id', $id)->update(['archived_at' => now()]);
        return response()->json(['message' => 'Storage location archived successfully']);
    }

    public function searchStorage(Request $request)
    {
        $q = $request->input('q');
        return DB::table('storage_location')
            ->where('location_name', 'like', "%{$q}%")
            ->orWhere('description', 'like', "%{$q}%")
            ->get();
    }
}
