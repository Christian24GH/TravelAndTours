import './index.css'

import React from 'react';
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";
import { AuthProvider } from './context/AuthProvider';
import { GuestRoute } from './layout/GuestRoute';
import { Layout } from './layout/ProtectedLayout';
import LandingPage from './main/landing'
import LoginPage from './main/login';
import NotFound from './main/not-found';

{/**Logistics1*/}
import DashboardLog1 from './logistics1/dashboard'
import Logistics1_InventoryPage from './logistics1/InventoryManagement'
import Logistics1_StorageOrgPage from './logistics1/StorageOrganization'
import Logistics1_StockMonitoringPage from './logistics1/StockMonitoring'
import Logistics1_SupplierManagementPage from './logistics1/SupplierManagement'
import Logistics1_PurchaseProcessingPage from './logistics1/PurchaseProcessing'
import Logistics1_ExpenseRecordsPage from './logistics1/ExpenseRecords'
import Logistics1_EquipmentSchedulingPage from './logistics1/EquipmentScheduling'
import Logistics1_DeliveryTransportTrackingPage from './logistics1/DeliveryTransportTracking'
import Logistics1_TourReportsPage from './logistics1/TourReports'
import Logistics1_AssetRegistrationPage from './logistics1/AssetRegistration'
import Logistics1_PredictiveMaintenancePage from './logistics1/PredictiveMaintenance'
import Logistics1_MaintenanceHistoryPage from './logistics1/MaintenanceHistory'
import Logistics1_DeliveryReceiptsPage from './logistics1/DeliveryReceipts'
import Logistics1_CheckInOutLogsPage from './logistics1/CheckInOutLogs'
import Logistics1_LogisticsReportsPage from './logistics1/LogisticsReports'

import LogisticsIIDashboard from './logisticsII/dashboard'
import LogisticsIIFleet from './logisticsII/fleet'
import LogisticsIIReservation from './logisticsII/reservation';
import LogisticsIIDispatchPage from './logisticsII/dispatch';
import LogisticsIIDispatchDetails from './logisticsII/details-dispatch'
import LogisticsIIMakeReservationPage from './logisticsII/make-reservation'
import LogisticsIIReservationDetails from './logisticsII/details-reservation'
import LogisticsIISuccessPage from './logisticsII/success-page'
import LogisticsIIDrivers from './logisticsII/drivers'


//console.log('app: src/main.jsx loaded'); 
const baseUrl = import.meta.env.VITE_BASE_URL

createRoot(document.getElementById('root')).render(
  // basename = baseUrl jsut like base value inside vite.config.js
  // Tells BrowserRouter that this is the base URL
  <BrowserRouter basename={baseUrl ? baseUrl : '/'}>
    <AuthProvider>
      <Routes>

        {/** Main Routes */}
        <Route element={<GuestRoute/>}>
          <Route path="/" element={<LandingPage/>}/>
          <Route path="/login" element={<LoginPage/>}/>
        </Route>
  
 
       {/**Logistics1*/}
        <Route path="/logistics1" element={<Layout allowedRoles={['LogisticI Admin', 'Super Admin']}/>}>
          <Route index element={<DashboardLog1/>}/>
          <Route path='InventoryManagement' element={<Logistics1_InventoryPage/>}/> {/***not defined on import*/}
          <Route path='StorageOrganization' element={<Logistics1_StorageOrgPage/>}/>  
          <Route path='StockMonitoring' element={<Logistics1_StockMonitoringPage/>}/> 
          <Route path='SupplierManagement' element={<Logistics1_SupplierManagementPage/>}/>
           <Route path='PurchaseProcessing' element={<Logistics1_PurchaseProcessingPage/>}/>
           <Route path='ExpenseRecords' element={<Logistics1_ExpenseRecordsPage/>}/>
           <Route path='EquipmentScheduling' element={<Logistics1_EquipmentSchedulingPage/>}/>
           <Route path='DeliveryTransportTracking' element={<Logistics1_DeliveryTransportTrackingPage/>}/>
           <Route path='TourReports' element={<Logistics1_TourReportsPage/>}/>
           <Route path='AssetRegistration' element={<Logistics1_AssetRegistrationPage/>}/>
           <Route path='PredictiveMaintenance' element={<Logistics1_PredictiveMaintenancePage/>}/>
           <Route path='MaintenanceHistory' element={<Logistics1_MaintenanceHistoryPage/>}/>
           <Route path='DeliveryReceipts' element={<Logistics1_DeliveryReceiptsPage/>}/>
           <Route path='CheckInOutLogs' element={<Logistics1_CheckInOutLogsPage/>}/>
           <Route path='LogisticsReports' element={<Logistics1_LogisticsReportsPage/>}/>
        </Route>  

        {/**LogisticsII */}
        <Route path="/logisticsII" element={<Layout allowedRoles={['LogisticsII Admin', 'Super Admin']}/>}>
          <Route index element={<LogisticsIIDashboard/>}/>
          <Route path='vehicles' element={<LogisticsIIFleet/>}/>
          <Route path='reservation'>
            <Route index element={<LogisticsIIReservation/>}/>
            <Route path='make' element={<LogisticsIIMakeReservationPage/>}/>
            <Route path=':batch_number' element={<LogisticsIIReservationDetails/>}/>
          </Route>
          <Route path='success' element={<LogisticsIISuccessPage/>}/>
          <Route path='dispatch'>
            <Route index element={<LogisticsIIDispatchPage/>}/>
            <Route path=':id' element={<LogisticsIIDispatchDetails/>}/>
          </Route>
          <Route path='drivers' element={<LogisticsIIDrivers/>}/>
        </Route>
        
        
        
        {/**NOT FOUND PAGE AS LAST CHILD OF ROUTES */}
        <Route path='*' element={<NotFound/>}/>
      </Routes>
    </AuthProvider>
  </BrowserRouter>
)
