<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use App\Models\PurchaseRequest;
use App\Models\PurchaseOrder;
use App\Models\ExpenseRecord;
use App\Models\FinancialBudget;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PSMController extends Controller
{
    // ================================
    // Supplier Management
    // ================================

    // 2.1.1 Add/Edit Supplier Profile
    public function addOrEditSupplier(Request $request)
    {
        // Validate incoming request data
        $validated = $request->validate([
            'core2_supplier_id' => 'required|exists:core2_supplier,core2_supplier_id',  // External supplier ID from CORE 2
            'supplier_name' => 'required|string|max:100',
            'contact_info' => 'nullable|string|max:255',
            'rating' => 'nullable|integer|min:1|max:5',
        ]);

        // Check if supplier exists or create a new one
        $supplier = Supplier::updateOrCreate(
            ['core2_supplier_id' => $validated['core2_supplier_id']],  // Match by CORE2 Supplier ID
            [
                'supplier_name' => $validated['supplier_name'],
                'contact_info' => $validated['contact_info'],
                'rating' => $validated['rating'],
                'sync_status' => 'pending',  // Set as pending until sync with CORE 2
            ]
        );

        return response()->json([
            'message' => $supplier->wasRecentlyCreated ? 'Supplier created successfully' : 'Supplier updated successfully',
            'supplier' => $supplier
        ], 200);
    }

    // 2.1.2 Track Contact Details
    public function trackSupplierContact(Request $request, $supplierId)
    {
        $validated = $request->validate([
            'contact_name' => 'required|string|max:100',
            'contact_email' => 'required|email|max:100',
            'contact_phone' => 'required|string|max:20',
        ]);

        // Add contact details to the supplier
        $supplier = Supplier::findOrFail($supplierId);
        // Here, we would typically store the contact details, 
        // but as per your schema, we need a separate `supplier_contacts` table (not provided here).

        return response()->json(['message' => 'Contact details added successfully']);
    }

    // 2.1.3 Rate Supplier Performance
    public function rateSupplierPerformance(Request $request, $supplierId)
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',  // Performance rating between 1 and 5
        ]);

        $supplier = Supplier::findOrFail($supplierId);
        $supplier->rating = $validated['rating'];
        $supplier->save();

        return response()->json(['message' => 'Supplier performance rated successfully']);
    }

    // ================================
    // Purchase Processing
    // ================================

    // 2.2.1 Create Purchase Request
    public function createPurchaseRequest(Request $request)
    {
        // Validate incoming data
        $validated = $request->validate([
            'equipment_id' => 'required|exists:equipment,equipment_id',
            'quantity' => 'required|integer|min:1',
            'requested_by' => 'nullable|string|max:100',
        ]);

        // Create the purchase request
        $purchaseRequest = new PurchaseRequest();
        $purchaseRequest->equipment_id = $validated['equipment_id'];
        $purchaseRequest->quantity = $validated['quantity'];
        $purchaseRequest->requested_by = $validated['requested_by'];
        $purchaseRequest->status = 'pending';  // Default status is pending
        $purchaseRequest->save();

        return response()->json(['message' => 'Purchase request created successfully', 'purchase_request' => $purchaseRequest], 201);
    }

    // 2.2.2 Approval Workflow
    public function approvePurchaseRequest(Request $request, $requestId)
    {
        // Validate the status change
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        $purchaseRequest = PurchaseRequest::findOrFail($requestId);
        $purchaseRequest->status = $validated['status'];
        $purchaseRequest->save();

        return response()->json(['message' => 'Purchase request status updated successfully']);
    }

    // 2.2.3 Issue Purchase Order
    public function issuePurchaseOrder(Request $request, $requestId)
    {
        // Validate incoming data
        $validated = $request->validate([
            'supplier_id' => 'required|exists:supplier,supplier_id',
            'total_amount' => 'required|numeric|min:0',
        ]);

        // Create the purchase order based on the approved purchase request
        $purchaseRequest = PurchaseRequest::findOrFail($requestId);

        if ($purchaseRequest->status !== 'approved') {
            return response()->json(['error' => 'Purchase request must be approved first'], 400);
        }

        $purchaseOrder = new PurchaseOrder();
        $purchaseOrder->request_id = $requestId;
        $purchaseOrder->supplier_id = $validated['supplier_id'];
        $purchaseOrder->total_amount = $validated['total_amount'];
        $purchaseOrder->status = 'issued';  // Default status is 'issued'
        $purchaseOrder->order_date = now();
        $purchaseOrder->save();

        return response()->json(['message' => 'Purchase order issued successfully', 'purchase_order' => $purchaseOrder], 201);
    }

    // ================================
    // Expense Records
    // ================================

    // 2.3.1 Record Purchase Amounts
    public function recordPurchaseAmount(Request $request, $orderId)
    {
        // Validate incoming data
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
        ]);

        // Record the purchase amount in the expense record
        $expenseRecord = new ExpenseRecord();
        $expenseRecord->order_id = $orderId;
        $expenseRecord->amount = $validated['amount'];
        $expenseRecord->payment_status = 'unpaid';  // Default status is unpaid
        $expenseRecord->save();

        return response()->json(['message' => 'Purchase amount recorded successfully', 'expense_record' => $expenseRecord], 201);
    }

    // 2.3.2 Track Payment Status
    public function trackPaymentStatus(Request $request, $expenseId)
    {
        // Validate incoming data
        $validated = $request->validate([
            'payment_status' => 'required|in:unpaid,paid,partial',
        ]);

        // Update payment status
        $expenseRecord = ExpenseRecord::findOrFail($expenseId);
        $expenseRecord->payment_status = $validated['payment_status'];
        $expenseRecord->save();

        return response()->json(['message' => 'Payment status updated successfully']);
    }

    // 2.3.3 Export Expense Reports
    public function exportExpenseReports(Request $request)
    {
        // Get all expense records
        $expenseRecords = ExpenseRecord::all();

        // Export logic here - You can export to CSV, Excel, PDF, etc.
        // For simplicity, let's return the expense records as JSON
        return response()->json(['expense_reports' => $expenseRecords]);
    }
}
