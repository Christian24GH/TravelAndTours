import './index.css'
import './ziggy'; // Import Ziggy's generated routes

import React from 'react';
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";
import { AuthProvider } from './context/AuthProvider';
import { GuestRoute } from './layout/GuestRoute';
import ProtectedLayout from './layout/ProtectedLayout';
import LoginPage from './main/login';
import LogisticsIIDashboard from './logisticsII/dashboard'
import LogisticsIIFleet from './logisticsII/fleet'
import LogisticsIIReservation from './logisticsII/reservation';
import LogisticsIIDispatchPage from './logisticsII/dispatch';
import DashboardHR2 from './hr2/mainhr2';
import ESS from './hr2/ess';
import { HelmetProvider } from 'react-helmet-async';


createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <HelmetProvider>
          <Routes>
            {/** Main Routes */}
            <Route element={<GuestRoute/>}>
              <Route path="/login" index element={<LoginPage/>}/>
            </Route>

            {/**LogisticsII */}
            <Route path="/logisticsII" element={<ProtectedLayout allowedRoles={['LogisticsII Admin', 'Super Admin']}/>}>
              <Route index element={<LogisticsIIDashboard/>}/>
              <Route path='vehicles' element={<LogisticsIIFleet/>}/>
              <Route path='reservation' element={<LogisticsIIReservation/>}/>
              <Route path='dispatch' element={<LogisticsIIDispatchPage/>}/>
            </Route>

            {/**HR2 */}
            <Route path="/hr2" element={<DashboardHR2/>}/>
            <Route path="/hr2/ess" element={<ESS/>}/>


            
          </Routes>
        </HelmetProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
