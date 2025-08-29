import './index.css'

import React from 'react';
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";
import { AuthProvider } from './context/AuthProvider';
import { GuestRoute } from './layout/GuestRoute';
import { Layout } from './layout/ProtectedLayout';
import LoginPage from './main/login';
import LogisticsIIDashboard from './logisticsII/dashboard'
import LogisticsIIFleet from './logisticsII/fleet'
import LogisticsIIReservation from './logisticsII/reservation';
import LogisticsIIDispatchPage from './logisticsII/dispatch';
import LogisticsIIMakeReservationPage from './logisticsII/make-reservation';


createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/** Main Routes */}
          <Route element={<GuestRoute/>}>
            <Route path="/login" index element={<LoginPage/>}/>
          </Route>

          {/**LogisticsII */}
          <Route path="/logisticsII" element={<Layout allowedRoles={['LogisticsII Admin', 'Super Admin']}/>}>
            <Route index element={<LogisticsIIDashboard/>}/>
            <Route path='vehicles' element={<LogisticsIIFleet/>}/>
            <Route path='reservation' element={<LogisticsIIReservation/>}/>
            <Route path='reservation/make' element={<LogisticsIIMakeReservationPage/>}/>
            <Route path='dispatch' element={<LogisticsIIDispatchPage/>}/>
          </Route>
  
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
