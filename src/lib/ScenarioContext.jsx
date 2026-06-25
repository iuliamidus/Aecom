// Global scenario state: the clock that drives everything "real-time", plus the
// audit log of operator actions (PRD F8). Deterministic — scrub the clock to
// rewind/replay the whole demo.

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'

const ScenarioContext = createContext(null)

export const MODEL_VERSION = 'risk-engine v1.4.0'
const TICK_MS = 1000

export function ScenarioProvider({ children }) {
  const [clock, setClock] = useState(12) // start mid-window so there's something to see
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1) // simulated hours advanced per real second
  const [audit, setAudit] = useState(() => seedAudit())
  const [plan, setPlan] = useState([]) // asset ids the operator has staged
  const [toast, setToast] = useState(null)
  const timer = useRef(null)
  const toastTimer = useRef(null)

  useEffect(() => {
    if (!playing) return
    timer.current = setInterval(() => {
      setClock((c) => {
        const next = Math.min(48, c + speed)
        if (next >= 48) setPlaying(false)
        return next
      })
    }, TICK_MS)
    return () => clearInterval(timer.current)
  }, [playing, speed])

  const logAction = useCallback((action, detail) => {
    setAudit((prev) => [
      {
        id: `A${Date.now()}`,
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        clock: Math.round(clockRef.current),
        user: 'M. Reyes (EOC Duty Manager)',
        model: MODEL_VERSION,
        action,
        detail,
      },
      ...prev,
    ])
  }, [])

  // keep a ref so logAction captures the live clock without re-creating
  const clockRef = useRef(clock)
  clockRef.current = clock
  const planRef = useRef(plan)
  planRef.current = plan

  const showToast = useCallback((msg) => {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2800)
  }, [])

  const addToPlan = useCallback((asset) => {
    if (planRef.current.includes(asset.id)) {
      showToast(`${asset.name} is already in the deployment plan`)
      return
    }
    setPlan((prev) => [...prev, asset.id])
    logAction('Added asset to deployment plan', `${asset.name} (${asset.id})`)
    showToast(`${asset.name} added to deployment plan`)
  }, [logAction, showToast])

  const removeFromPlan = useCallback((id) => {
    setPlan((prev) => prev.filter((x) => x !== id))
  }, [])

  const value = {
    clock,
    setClock,
    playing,
    setPlaying,
    togglePlay: () => setPlaying((p) => !p),
    reset: () => {
      setPlaying(false)
      setClock(12)
    },
    speed,
    setSpeed,
    audit,
    logAction,
    plan,
    addToPlan,
    removeFromPlan,
    toast,
    showToast,
  }
  return <ScenarioContext.Provider value={value}>{children}</ScenarioContext.Provider>
}

export function useScenario() {
  const ctx = useContext(ScenarioContext)
  if (!ctx) throw new Error('useScenario must be used within ScenarioProvider')
  return ctx
}

function seedAudit() {
  return [
    { id: 'A0', time: '07:42:10', clock: 6, user: 'System', model: MODEL_VERSION, action: 'Forecast trigger ingested', detail: 'NOAA advisory — Cat-3 track, 48h lead' },
    { id: 'A1', time: '07:42:12', clock: 6, user: 'System', model: MODEL_VERSION, action: 'Risk view computed', detail: '48 assets scored across grid + water' },
  ]
}
