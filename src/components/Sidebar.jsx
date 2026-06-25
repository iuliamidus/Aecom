import { NavLink } from 'react-router-dom'
import { useScenario } from '../lib/ScenarioContext.jsx'
import { IconGrid, IconMap, IconChart, IconEye, IconTruck, IconBot } from './icons.jsx'

const LINKS = [
  { to: '/dashboard', label: 'EOC Dashboard', Icon: IconMap },
  { to: '/forecasting', label: 'Forecasting', Icon: IconChart },
  { to: '/aerial', label: 'Aerial / CV', Icon: IconEye },
  { to: '/deployment', label: 'Deployment', Icon: IconTruck },
  { to: '/copilot', label: 'Copilot', Icon: IconBot },
]

export function Sidebar() {
  const { plan } = useScenario()
  return (
    <aside className="app-sidebar">
      <div className="app-sidebar__brand">
        <NavLink to="/" style={{ textDecoration: 'none' }}>
          <span className="aecom-wordmark">AECOM</span>
        </NavLink>
        <small>SGW Operational Resilience</small>
      </div>
      <nav className="app-nav">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
          <IconGrid /> Overview
        </NavLink>
        {LINKS.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'active' : '')}>
            <Icon /> {label}
            {to === '/deployment' && plan.length > 0 && <span className="nav-badge">{plan.length}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="app-sidebar__foot">
        <div>Decision Support Platform</div>
        <div><b>AI recommends</b> · humans decide</div>
      </div>
    </aside>
  )
}
