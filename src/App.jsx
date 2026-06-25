import { Routes, Route } from 'react-router-dom'
import { AppShell } from './components/AppShell.jsx'
import { Overview } from './pages/Overview.jsx'
import { Dashboard } from './pages/Dashboard.jsx'
import { Forecasting } from './pages/Forecasting.jsx'
import { Dependencies } from './pages/Dependencies.jsx'
import { Aerial } from './pages/Aerial.jsx'
import { Deployment } from './pages/Deployment.jsx'
import { Copilot } from './pages/Copilot.jsx'

export function App() {
  return (
    <Routes>
      {/* Marketing landing — standalone, no operator shell */}
      <Route path="/" element={<Overview />} />
      {/* Operator app — sidebar + scenario bar */}
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/forecasting" element={<Forecasting />} />
        <Route path="/dependencies" element={<Dependencies />} />
        <Route path="/aerial" element={<Aerial />} />
        <Route path="/deployment" element={<Deployment />} />
        <Route path="/copilot" element={<Copilot />} />
      </Route>
    </Routes>
  )
}
