import './index.css'

import React from 'react';
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";
import { AuthProvider } from './context/AuthProvider';
import { GuestRoute } from './layout/GuestRoute';
import { Layout } from './layout/ProtectedLayout';
import LoginPage from './main/login';

// Logistics II Pages
import LogisticsIIDashboard from './logisticsII/dashboard'
import LogisticsIIFleet from './logisticsII/fleet'
import LogisticsIIReservation from './logisticsII/reservation';
import LogisticsIIDispatchPage from './logisticsII/dispatch';

// HR1 Pages
import Hr1Dashboard from './hr1/dashboard';
import Hr1ApplicantPage from "./hr1/applicant";
import Hr1InterviewPage from "./hr1/interview"; 
import Hr1Recruitment from "./hr1/recruitment";
import Hr1Onboarding from "./hr1/onboarding";
import Hr1Performance from "./hr1/performance";
import Hr1Recognition from "./hr1/recognition";
import Hr1JobPosting from "./hr1/jobposting";

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/** Main Routes */}
          <Route element={<GuestRoute/>}>
            <Route path="/login" index element={<LoginPage/>}/>
          </Route>

          {/** LogisticsII */}
          <Route path="/logisticsII" element={<Layout allowedRoles={['LogisticsII Admin', 'Super Admin']}/>}>
            <Route index element={<LogisticsIIDashboard/>}/>
            <Route path='vehicles' element={<LogisticsIIFleet/>}/>
            <Route path='reservation' element={<LogisticsIIReservation/>}/>
            <Route path='dispatch' element={<LogisticsIIDispatchPage/>}/>
          </Route>

          {/** HR1 */}
          <Route path="/hr1" element={<Layout allowedRoles={['HR1 Admin', 'Super Admin']}/>}>
  <Route index element={<Hr1Dashboard/>}/> 

  {/* Application Management */}
  <Route path="applicants">
    <Route index element={<Hr1ApplicantPage/>}/>   {/* /hr1/applicants */}
    <Route path="interviews" element={<Hr1InterviewPage/>}/>  {/* /hr1/applicants/interviews */}
  </Route>
   {/* Recruitment Management */}
  <Route path="recruitment" element={<Hr1Recruitment/>}/>
  <Route path="jobposting" element={<Hr1JobPosting/>}/>

  <Route path="recruitment" element={<Hr1Recruitment/>}/>
  <Route path="onboarding" element={<Hr1Onboarding/>}/>
  <Route path="performance" element={<Hr1Performance/>}/>
  <Route path="recognition" element={<Hr1Recognition/>}/>
</Route>


        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)