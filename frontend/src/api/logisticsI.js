import { configureEcho } from "@laravel/echo-react";
import Echo from "laravel-echo";

const echoConfig = {
    wsPort: 6061,
    wssPort: 6061,
    broadcaster: "reverb",
    key: "luoioknoyyzonvz8gf6o",
    wsHost: "localhost",
    forceTLS: window.location.protocol === "https:",
    enabledTransports: ["ws", "wss"],
};

const backendPort = 8093;
const backendUri = `http://localhost:${backendPort}`;

export const logisticsI = {
    reverb: {
        ...echoConfig,
        config: () => configureEcho(echoConfig)
    },

    backend: {
        port: backendPort,
        uri: backendUri,
        api: {
            // ============================
            // Smart Warehousing System (SWS)
            // ============================

            // Equipment Routes
            equipment: `${backendUri}/api/equipment`,
            equipmentSearch: `${backendUri}/api/equipment/search`,
            equipmentAdd: `${backendUri}/api/equipment/add`,
            equipmentUpdate: `${backendUri}/api/equipment/change`,
            equipmentArchive: `${backendUri}/api/equipment/archive`,
            lowStockAlert: `${backendUri}/api/equipment/low-stock-alert`,
            overStockAlert: `${backendUri}/api/equipment/overstock-alert`,
            categorizeEquipment: `${backendUri}/api/equipment/{id}/categorize/{categoryId}`,
            archiveOldEquipment: `${backendUri}/api/equipment/{id}/archive-old`,

            // ================================
            // Procurement & Sourcing Management (PSM)
            // ================================

            // Supplier Management Routes
            suppliers: `${backendUri}/api/suppliers`,
            supplierAdd: `${backendUri}/api/suppliers/add`,
            supplierUpdate: `${backendUri}/api/suppliers/{id}`,
            supplierArchive: `${backendUri}/api/suppliers/archive/{id}`,

            // Purchase Request Routes
            purchaseRequests: `${backendUri}/api/requests`,
            purchaseRequestAdd: `${backendUri}/api/requests/add`,
            purchaseRequestUpdate: `${backendUri}/api/requests/{id}`,

            // Purchase Order Routes
            purchaseOrders: `${backendUri}/api/orders`,
            purchaseOrderAdd: `${backendUri}/api/orders/add`,
            purchaseOrderUpdate: `${backendUri}/api/orders/{id}`,

            // Expense Records Routes
            expenseRecords: `${backendUri}/api/expenses`,
            expenseRecordAdd: `${backendUri}/api/expenses/add`,
            expenseRecordUpdate: `${backendUri}/api/expenses/{id}`,

            // ================================
            // Project Logistic Tracker (PLT)
            // ================================

            // Equipment Scheduling Routes
            equipmentSchedules: `${backendUri}/api/equipment-schedule`,
            equipmentScheduleAdd: `${backendUri}/api/equipment-schedule`,
            equipmentScheduleUpdate: `${backendUri}/api/equipment-schedule/{id}`,
            equipmentScheduleApprove: `${backendUri}/api/equipment-schedule/{id}/approve`,

            // Delivery & Transport Routes
            deliveries: `${backendUri}/api/delivery`,
            deliveryAdd: `${backendUri}/api/delivery`,
            deliveryUpdate: `${backendUri}/api/delivery/{id}`,
            markDelivered: `${backendUri}/api/delivery/{id}/mark-delivered`,

            // ================================
            // Asset Lifecycle & Maintenance (ALMS)
            // ================================

            // Asset Registration & QR Tagging
            assets: `${backendUri}/api/asset`,
            assetAdd: `${backendUri}/api/asset`,
            assetUpdate: `${backendUri}/api/asset/{id}`,
            assetArchive: `${backendUri}/api/asset/archive/{id}`,

            // Maintenance Routes
            maintenance: `${backendUri}/api/maintenance`,
            maintenanceAdd: `${backendUri}/api/maintenance`,
            maintenanceUpdate: `${backendUri}/api/maintenance/{id}`,
            maintenanceArchive: `${backendUri}/api/maintenance/archive/{id}`,

            // ================================
            // Document Tracking & Logistics Records (DTRS)
            // ================================

            // Delivery Receipts Routes
            deliveryReceipts: `${backendUri}/api/delivery-receipts`,
            deliveryReceiptAdd: `${backendUri}/api/delivery-receipts`,
            deliveryReceiptUpdate: `${backendUri}/api/delivery-receipts/{id}`,
            deliveryReceiptArchive: `${backendUri}/api/delivery-receipts/archive/{id}`,

            // Equipment Logs Routes
            equipmentLogs: `${backendUri}/api/equipment-logs`,
            equipmentLogAdd: `${backendUri}/api/equipment-logs`,
            equipmentLogUpdate: `${backendUri}/api/equipment-logs/{id}`,
            equipmentLogArchive: `${backendUri}/api/equipment-logs/archive/{id}`,

            // Logistics Reports Routes
            logisticsReports: `${backendUri}/api/logistics-reports`,
            logisticsReportAdd: `${backendUri}/api/logistics-reports`,
            logisticsReportUpdate: `${backendUri}/api/logistics-reports/{id}`,
            logisticsReportArchive: `${backendUri}/api/logistics-reports/archive/{id}`,

            // Fleet Documents Routes
            fleetDocuments: `${backendUri}/api/fleet-documents`,
            fleetDocumentAdd: `${backendUri}/api/fleet-documents`,
            fleetDocumentUpdate: `${backendUri}/api/fleet-documents/{id}`,
            fleetDocumentArchive: `${backendUri}/api/fleet-documents/archive/{id}`,

            // QR Code APIs
            qrAssets: `${backendUri}/api/assets`,
            qrAssetAdd: `${backendUri}/api/assets`,
            qrAssetShow: `${backendUri}/api/assets/{token}`,
        },
    }
};
