import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";
import Layout from './layout/Layout';
import Dashboard from './pages/dashboard'
import Fleet from './pages/fleet'
import { MaintenancePage } from './pages/maintenance';
import './index.css'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard/>}/>
        <Route path='/fleet' element={<Fleet/>}/>
        <Route path='/maintenance' element={<MaintenancePage/>}/>
      </Route>
    </Routes>
  </BrowserRouter>,
)
