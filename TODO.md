# TODO: Design Logistics1 Components

## AssetRegistration.jsx
- [x] Add imports for React hooks, axios, logisticsI API, UI components (Table, Button, Input, Dialog, Label, Select)
- [x] Implement state management for assets, loading, search, dialog
- [x] Add fetchAssets function with API call
- [x] Add filteredAssets based on search
- [x] Create table with columns: ID, Asset Name, Category, QR Code, Status, Actions
- [x] Add search input
- [x] Implement dialog for add/edit asset
- [x] Add form fields: asset_name, category, qr_code, status
- [x] Implement handleSubmit for add/edit
- [x] Add archive action

## PredictiveMaintenance.jsx
- [x] Add imports for React hooks, axios, logisticsI API, UI components (Table, Button, Input, Dialog, Label, Select)
- [x] Implement state management for alerts, loading, search, dialog
- [x] Add fetchAlerts function with API call (use maintenance API or placeholder)
- [x] Add filteredAlerts based on search
- [x] Create table with columns: ID, Equipment, Predicted Issue, Confidence, Date, Status, Actions
- [x] Add search input
- [x] Implement dialog for view alert details
- [x] Add form fields for view: equipment, issue, confidence, date, status
- [x] Add mark resolved action

## MaintenanceHistory.jsx
- [x] Add imports for React hooks, axios, logisticsI API, UI components (Table, Button, Input, Dialog, Label, Select)
- [x] Implement state management for maintenance, loading, search, dialog
- [x] Add fetchMaintenance function with API call
- [x] Add filteredMaintenance based on search
- [x] Create table with columns: ID, Asset, Maintenance Type, Date, Technician, Status, Actions
- [x] Add search input
- [x] Implement dialog for add/edit maintenance
- [x] Add form fields: asset_id, maintenance_type, date, technician, status
- [x] Implement handleSubmit for add/edit
- [x] Add archive action

## DeliveryReceipts.jsx
- [x] Add imports for React hooks, axios, logisticsI API, UI components (Table, Button, Input, Dialog, Label, Select)
- [x] Implement state management for receipts, loading, search, dialog
- [x] Add fetchReceipts function with API call
- [x] Add filteredReceipts based on search
- [x] Create table with columns: ID, Receipt Number, Date, Supplier, Status, Actions
- [x] Add search input
- [x] Implement dialog for add/edit receipt
- [x] Add form fields: receipt_number, date, supplier, status
- [x] Implement handleSubmit for add/edit
- [x] Add archive action

## CheckInOutLogs.jsx
- [x] Add imports for React hooks, axios, logisticsI API, UI components (Table, Button, Input, Dialog, Label, Select)
- [x] Implement state management for logs, loading, search, dialog
- [x] Add fetchLogs function with API call
- [x] Add filteredLogs based on search
- [x] Create table with columns: ID, Equipment, Action, Date, User, Actions
- [x] Add search input
- [x] Implement dialog for add/edit log
- [x] Add form fields: equipment_id, action (check-in/check-out), date, user
- [x] Implement handleSubmit for add/edit
- [x] Add archive action

## LogisticsReports.jsx
- [x] Add imports for React hooks, axios, logisticsI API, UI components (Table, Button, Input, Dialog, Label, Select, Textarea)
- [x] Implement state management for reports, loading, search, dialog
- [x] Add fetchReports function with API call
- [x] Add filteredReports based on search
- [x] Create table with columns: ID, Report Type, Generated Date, Status, Actions
- [x] Add search input
- [x] Implement dialog for generating new report
- [x] Add form fields: report_type (dropdown), date_range
- [x] Implement handleSubmit for add report
- [x] Add archive action

## Testing
- [ ] Test API integration for all components
- [ ] Verify responsive design
- [ ] Check consistent styling across components
