import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";
import Layout from './layout/Layout';
import Dashboard from './logisticsII/dashboard'
import Fleet from './logisticsII/fleet'
import { MaintenancePage } from './logisticsII/maintenance';
import './index.css'
import LoginPage from './main/login';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      {/** Main Routes */}
      <Route path="/" index element={<LoginPage/>}/>

      {/**LogisticsII */}
      <Route path="/logisticsII/" element={<Layout />}>
        <Route index element={<Dashboard/>}/>
        <Route path='fleet' element={<Fleet/>}/>
        <Route path='maintenance' element={<MaintenancePage/>}/>
      </Route>

      
    </Routes>
  </BrowserRouter>,
)
