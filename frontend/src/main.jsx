import './index.css'

import React from 'react';
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";
import { AuthProvider } from './context/AuthProvider';
import { GuestRoute } from './layout/GuestRoute';
import { Layout } from './layout/ProtectedLayout';
import LoginPage from './main/login';
import Landing from './main/landing';
// hr3
import Dash from './hr3/dashboard'
import Attendance from './hr3/attendance'
import Clocking from './hr3/employeeclocking'
import AttendanceRequest from './hr3/attendancerequest'
import Timesheet from './hr3/timesheet'
import Schedule from './hr3/schedule'
import ShiftSwap from './hr3/schedulepublishing'
import Leave from './hr3/leave'
import ApprovedLeaves from './hr3/approveleaves'
import Claims from './hr3/claims'
// logisticsI
import LogisticsIDashboard from './logistics1/dashboard'
// logisticsII
import LogisticsIIDashboard from './logisticsII/dashboard'
import LogisticsIIFleet from './logisticsII/fleet'
import LogisticsIIReservation from './logisticsII/reservation';
import LogisticsIIDispatchPage from './logisticsII/dispatch';
import LogisticsIIMakeReservationPage from './logisticsII/make-reservation'


createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/** Main Routes */}
          <Route path="/" element={<Landing/>}/>

          <Route element={<GuestRoute/>}>
            <Route path="/login" index element={<LoginPage/>}/>
          </Route>

          {/**LogisticsI */}
          <Route path="/logisticsI" element={<Layout allowedRoles={['LogisticI Admin', 'Super Admin']}/>}>
            <Route index element={<LogisticsIDashboard/>}/>
          </Route>

          {/**LogisticsII */}
          <Route path="/logisticsII" element={<Layout allowedRoles={['LogisticsII Admin', 'Super Admin']}/>}>
            <Route index element={<LogisticsIIDashboard/>}/>
            <Route path='vehicles' element={<LogisticsIIFleet/>}/>
            <Route path='reservation' element={<LogisticsIIReservation/>}/>
            <Route path='reservation/make' element={<LogisticsIIMakeReservationPage/>}/>
            <Route path='dispatch' element={<LogisticsIIDispatchPage/>}/>
          </Route>

          {/**HR3 */}
          <Route path="/hr3" element={<Layout allowedRoles={['HR3 Manager', 'Super Admin']}/>}>
            <Route index element={<Dash/>}/>
            <Route path='attendance' element={<Attendance/>}/>
            <Route path='employee-clocking' element={<Clocking/>}/>
            <Route path='attendance-requests' element={<AttendanceRequest/>}/>
            <Route path='timesheet' element={<Timesheet/>}/>
            <Route path='schedule' element={<Schedule/>}/>
            <Route path='schedulepublishing' element={<ShiftSwap/>}/>
            <Route path='leave' element={<Leave/>}/>
            <Route path='approvedleaves' element={<ApprovedLeaves/>}/>
            <Route path='claims' element={<Claims/>}/>
          </Route>
  
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)