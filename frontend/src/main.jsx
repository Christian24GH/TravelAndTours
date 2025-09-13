import './index.css'

import React from 'react';
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";
import { AuthProvider } from './context/AuthProvider';
import { GuestRoute } from './layout/GuestRoute';
import { Layout } from './layout/ProtectedLayout';
import LandingPage from './main/landing'
import LoginPage from './main/login';

import HR2Dashboard from './hr2/db';


import LogisticsIIDashboard from './logisticsII/dashboard'
import LogisticsIIFleet from './logisticsII/fleet'
import LogisticsIIReservation from './logisticsII/reservation';
import LogisticsIIDispatchPage from './logisticsII/dispatch';
import LogisticsIIMakeReservationPage from './logisticsII/make-reservation'
import LogisticsIIReservationDetails from './logisticsII/details-reservation'
import LogisticsIIDrivers from './logisticsII/drivers'

console.log('app: src/main.jsx loaded'); 

createRoot(document.getElementById('root')).render(
  // basename = baseUrl jsut like base value inside vite.config.js
  // Tells BrowserRouter that this is the base URL
  <BrowserRouter basename="/TravelAndTour/frontend/dist/">
    <AuthProvider>
      <Routes>
        {/** Main Routes */}
        <Route element={<GuestRoute/>}>
          <Route path="/" element={<LandingPage/>}/>
          <Route path="/login" element={<LoginPage/>}/>
        </Route>
        {/**HR 2 */}
        <Route path="/human-resource-II" element={<Layout allowedRoles={['HR2 Admin', 'Super Admin']}/>}>
          <Route index element={<HR2Dashboard/>}/>

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
          <Route path='dispatch' element={<LogisticsIIDispatchPage/>}/>
          <Route path='drivers' element={<LogisticsIIDrivers/>}/>
        </Route>
        <Route path='*'/>
      </Routes>
    </AuthProvider>
  </BrowserRouter>
)