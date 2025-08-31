import './index.css'
import './ziggy'; 
import React from 'react';
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { AuthProvider } from './context/AuthProvider';
import { GuestRoute } from './layout/GuestRoute';
import ProtectedLayout from './layout/ProtectedLayout';
import LoginPage from './main/login';
import LogisticsIIDashboard from './logisticsII/dashboard'
import LogisticsIIFleet from './logisticsII/fleet'
import LogisticsIIReservation from './logisticsII/reservation';
import LogisticsIIDispatchPage from './logisticsII/dispatch';
import HR2Dashboard from './hr2/db';
import CompetencyManagement from './hr2/cms';
import LearningManagement from './hr2/lms';
import TrainingManagement from './hr2/tms';
import SuccessionPlanning from './hr2/sps';
import HR2Admin from './hr2/admin';
import HR2ESS from './hr2/ess';
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


            {/** Human Resources 2 */}
            <Route path="/hr2" element={<ProtectedLayout allowedRoles={['HR2 Admin', 'Employee', 'Super Admin']}/>}>
              <Route index element={<Navigate to="/hr2/db" replace />} />
              <Route path="db" element={<HR2Dashboard/>}/>
              <Route path="cms" element={<CompetencyManagement/>}/>
              <Route path="lms" element={<LearningManagement/>}/>
              <Route path="tms" element={<TrainingManagement/>}/>
              <Route path="sps" element={<SuccessionPlanning/>}/>
              <Route path="admin" element={<HR2Admin/>}/>
              <Route path="ess" element={<HR2ESS/>}/>
            </Route>


            
          </Routes>
        </HelmetProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
