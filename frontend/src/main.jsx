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
