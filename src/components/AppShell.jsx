import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar.jsx'
import { ScenarioBar } from './ScenarioBar.jsx'
import { CopilotLauncher } from './CopilotPanel.jsx'
import { useScenario } from '../lib/ScenarioContext.jsx'

// Shell for the in-app (operator) pages: sidebar + scenario bar + routed content.
export function AppShell() {
  const { toast } = useScenario()
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <ScenarioBar />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
      <CopilotLauncher />
      {toast && (
        <div className="app-toast" role="status">
          <span className="app-toast__check">✓</span> {toast}
        </div>
      )}
    </div>
  )
}

// Page header helper.
export function PageHead({ title, children }) {
  return (
    <header className="app-page-head">
      <h1>{title}</h1>
      {children && <p>{children}</p>}
    </header>
  )
}
