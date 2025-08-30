<?php
use App\Http\Controllers\{
    EquipmentManagementController,
    PSMController,
    ProjectLogisticTrackerController,
    AssetLifecycleMaintenanceController,
    DTRSController
};
use Illuminate\Support\Facades\Route;
// ===========================
// Smart Warehousing System (SWS)
// ===========================

// ----------------- Equipment -----------------
Route::get('/equipment', [EquipmentManagementController::class, 'index']);
Route::get('/equipment/{id}', [EquipmentManagementController::class, 'show']);
Route::post('/equipment/add', [EquipmentManagementController::class, 'storeEquipment']);
Route::put('/equipment/change/{id}', [EquipmentManagementController::class, 'updateEquipment']);
Route::put('/equipment/archive/{id}', [EquipmentManagementController::class, 'archiveEquipment']);
Route::get('/equipment/search', [EquipmentManagementController::class, 'searchEquipment']);
Route::put('/equipment/{id}/update-stock', [EquipmentManagementController::class, 'updateStock']);

// Equipment Category Routes
Route::get('/equipment-category', [EquipmentManagementController::class, 'indexCategory']);
Route::get('/equipment-category/{id}', [EquipmentManagementController::class, 'showCategory']);
Route::post('/equipment-category/add', [EquipmentManagementController::class, 'storeCategory']);
Route::put('/equipment-category/change/{id}', [EquipmentManagementController::class, 'updateCategory']);
Route::put('/equipment-category/archive/{id}', [EquipmentManagementController::class, 'archiveCategory']);
Route::get('/equipment-category/search', [EquipmentManagementController::class, 'searchCategory']);

// Storage Location Routes
Route::get('/storage-location', [EquipmentManagementController::class, 'indexStorage']);
Route::get('/storage-location/{id}', [EquipmentManagementController::class, 'showStorage']);
Route::post('/storage-location/add', [EquipmentManagementController::class, 'storeStorage']);
Route::put('/storage-location/change/{id}', [EquipmentManagementController::class, 'updateStorage']);
Route::put('/storage-location/archive/{id}', [EquipmentManagementController::class, 'archiveStorage']);
Route::get('/storage-location/search', [EquipmentManagementController::class, 'searchStorage']);

// ============================
// Procurement & Sourcing Management
// ============================
// ================================
// Supplier Management Routes
// ================================
// 2.1.1 Add/Edit Supplier Profile
Route::post('/suppliers', [PSMController::class, 'addOrEditSupplier']);  // Add or Edit Supplier Profile
// 2.1.2 Track Contact Details
Route::post('/suppliers/{id}/contact', [PSMController::class, 'trackSupplierContact']);  // Track Supplier Contact Details
// 2.1.3 Rate Supplier Performance
Route::post('/suppliers/{id}/rate', [PSMController::class, 'rateSupplierPerformance']);  // Rate Supplier Performance

// ================================
// Purchase Processing Routes
// ================================

// 2.2.1 Create Purchase Request
Route::post('/purchase-requests', [PSMController::class, 'createPurchaseRequest']);  // Create Purchase Request
// 2.2.2 Approval Workflow
Route::put('/purchase-requests/{id}/approve', [PSMController::class, 'approvePurchaseRequest']);  // Approve Purchase Request
// 2.2.3 Issue Purchase Order
Route::post('/purchase-orders/{requestId}', [PSMController::class, 'issuePurchaseOrder']);  // Issue Purchase Order

// ================================
// Expense Records Routes
// ================================

// 2.3.1 Record Purchase Amounts
Route::post('/expenses/{orderId}/amount', [PSMController::class, 'recordPurchaseAmount']);  // Record Purchase Amount
// 2.3.2 Track Payment Status
Route::put('/expenses/{expenseId}/status', [PSMController::class, 'trackPaymentStatus']);  // Track Payment Status
// 2.3.3 Export Expense Reports
Route::get('/expenses/export', [PSMController::class, 'exportExpenseReports']);  // Export Expense Reports


// ============================
// Project Logistic Tracker (PLT) Routes
// ============================

// Equipment Scheduling Routes
Route::post('/assign-equipment-to-tour', [ProjectLogisticTrackerController::class, 'assignEquipmentToTour']);
Route::put('/equipment-schedules/{scheduleId}/set-date-time', [ProjectLogisticTrackerController::class, 'setDateAndTimeOfUse']);
Route::put('/equipment-schedules/{scheduleId}/approve', [ProjectLogisticTrackerController::class, 'approveSchedule']);

// Delivery & Transport Tracking Routes
Route::post('/assign-vehicle-for-delivery', [ProjectLogisticTrackerController::class, 'assignVehicleForDelivery']);
Route::put('/deliveries/{deliveryId}/record-driver-details', [ProjectLogisticTrackerController::class, 'recordDriverDetails']);
Route::put('/deliveries/{deliveryId}/mark-as-delivered', [ProjectLogisticTrackerController::class, 'markAsDelivered']);

// Tour Report Routes
Route::get('/tour-projects/{tourProjectId}/usage-summary', [ProjectLogisticTrackerController::class, 'usageSummaryPerTrip']);
Route::get('/tour-projects/{tourProjectId}/efficiency-report', [ProjectLogisticTrackerController::class, 'transportEfficiencyReport']);
Route::get('/tour-projects/{tourProjectId}/delays-issues-report', [ProjectLogisticTrackerController::class, 'delaysAndIssuesReport']);

//==================================================
// Asset Lifecycle & Maintenance (ALMS)
//==================================================
// Asset Registration & QR Tagging
Route::post('/asset/register', [AssetLifecycleMaintenanceController::class, 'registerAsset']); // Register new asset and generate QR
Route::get('/asset/scan', [AssetLifecycleMaintenanceController::class, 'getAssetByQR']); // Retrieve asset details by QR scan
Route::put('/asset/{assetId}/project', [AssetLifecycleMaintenanceController::class, 'linkToProject']); // Link asset to a project

// Predictive Maintenance (Usage Tracking & Alerts)
Route::post('/asset/{assetId}/usage', [AssetLifecycleMaintenanceController::class, 'recordUsage']); // Record asset usage (hours, mileage)
Route::post('/asset/{assetId}/maintenance-alert', [AssetLifecycleMaintenanceController::class, 'checkForMaintenanceAlerts']); // Create maintenance alert
Route::get('/asset/{assetId}/suggest-replacement', [AssetLifecycleMaintenanceController::class, 'suggestReplacement']); // Suggest replacement based on repair history

// Maintenance History & Reporting
Route::post('/asset/{assetId}/maintenance', [AssetLifecycleMaintenanceController::class, 'logRepair']); // Log maintenance details (repair, replacement)
Route::get('/asset/{assetId}/repair-cost', [AssetLifecycleMaintenanceController::class, 'trackRepairCost']); // Track total repair cost
Route::get('/asset/{assetId}/maintenance-report', [AssetLifecycleMaintenanceController::class, 'generateMaintenanceReport']); // Generate maintenance report

// Archive Asset
Route::put('/asset/archive/{assetId}', [AssetLifecycleMaintenanceController::class, 'archiveAsset']); // Archive asset (soft delete)


//==================================================
// Document Tracking & Records System (DTRS)
//==================================================
// Delivery Receipts
Route::post('/dtrs/upload-delivery-proof', [DTRSController::class, 'uploadDeliveryProof']);
Route::get('/dtrs/search-by-tour-project', [DTRSController::class, 'searchByTourOrProject']);
Route::get('/dtrs/validate-reference', [DTRSController::class, 'validateDocumentReference']);

// Equipment Logs
Route::post('/dtrs/record-equipment-borrowed', [DTRSController::class, 'recordEquipmentBorrowed']);
Route::put('/dtrs/mark-returned-equipment/{logId}', [DTRSController::class, 'markEquipmentReturned']);
Route::put('/dtrs/flag-lost-damaged-item/{logId}', [DTRSController::class, 'flagLostOrDamagedItem']);

// Logistics Reports
Route::post('/dtrs/generate-monthly-report', [DTRSController::class, 'generateMonthlyReport']);
Route::get('/dtrs/export-report/{reportId}', [DTRSController::class, 'exportReport']);
Route::put('/dtrs/archive-report/{reportId}', [DTRSController::class, 'archiveOldReports']);
