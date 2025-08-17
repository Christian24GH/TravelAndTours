import './index.css'

import React from 'react';
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";
import { AuthProvider } from './context/AuthProvider';
import { GuestRoute } from './layout/GuestRoute';
import { Layout } from './layout/ProtectedLayout';
import LoginPage from './main/login';
import Dashboard from './logisticsII/dashboard'
import Fleet from './logisticsII/fleet'
import { MaintenancePage } from './logisticsII/maintenance';

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
            <Route path="/logisticsII/" element={<Layout/>}>
              <Route path='dashboard' index element={<Dashboard/>}/>
              <Route path='fleet' element={<Fleet/>}/>
              <Route path='maintenance' element={<MaintenancePage/>}/>
            </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
