import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
import App from './App.jsx'
import './App.css'
import Dashboard  from './pages/logisticsII/Dashboard.jsx'
import { routes } from './routes.jsx'
import Login from './pages/Login.jsx'
import Fleet from './pages/logisticsII/Fleet.jsx'
import DashboardLayout from './layout/DashboardLayout.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes >
      <Route path={routes.Login} element={<Login/>}/>
      <Route element={<DashboardLayout/>}>
        <Route path="/" element={<App/>}/>
        <Route path={routes.LogisticsIIDashboard} element={<Dashboard/>}/>
        <Route path={routes.LogisticsIIFleet} element={<Fleet/>}/>
      </Route>
    </Routes>
  </BrowserRouter>,
)
