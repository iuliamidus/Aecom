import { useState } from 'react'
import { useWeatherAlerts } from '../lib/useWeatherAlerts.js'
import { RiskBadge } from './RiskBadge.jsx'

function ago(ts) {
  if (!ts) return 'never'
  const s = Math.round((Date.now() - ts) / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m ago`
  return `${Math.round(m / 60)}h ago`
}

const STATUS_META = {
  live: { dot: '#00A651', label: 'LIVE' },
  cached: { dot: '#E0A100', label: 'CACHED' },
  loading: { dot: '#9aa6a6', label: 'CONNECTING' },
  error: { dot: '#C0362C', label: 'OFFLINE' },
}

// Live National Weather Service alert feed — the real-world hazard trigger
// (PRD §8). Hits api.weather.gov directly from the browser; no key, no backend.
export function WeatherAlertsBanner({ area = 'SC', areaLabel = 'South Carolina' }) {
  const { alerts, status, fetchedAt, error } = useWeatherAlerts(area)
  const [open, setOpen] = useState(false)
  const meta = STATUS_META[status] || STATUS_META.loading
  const top = alerts[0]
  const accent = top ? `var(--risk-${top.band})` : 'var(--aecom-teal)'

  return (
    <div className="wx-banner" style={{ borderLeftColor: accent }}>
      <div className="wx-banner__main" onClick={() => alerts.length && setOpen((o) => !o)}>
        <span className="wx-status" title={error || `Feed status: ${status}`}>
          <span className="wx-status__dot" style={{ background: meta.dot }} />
          {meta.label}
        </span>

        <div className="wx-banner__text">
          <div className="wx-banner__title">
            NWS active alerts · {areaLabel}
            <span className="wx-source">api.weather.gov</span>
          </div>
          <div className="wx-banner__sub">
            {status === 'loading' && 'Contacting the National Weather Service…'}
            {status === 'error' && 'Feed unreachable — no cached data available.'}
            {(status === 'live' || status === 'cached') &&
              (alerts.length === 0
                ? 'No active alerts for this area right now.'
                : `${alerts.length} active ${alerts.length === 1 ? 'alert' : 'alerts'}${top ? ` · most severe: ${top.event}` : ''}`)}
          </div>
        </div>

        <div className="wx-banner__meta">
          <span className="wx-updated">updated {ago(fetchedAt)}</span>
          {alerts.length > 0 && (
            <span className="wx-toggle">{open ? 'Hide' : 'Details'}</span>
          )}
        </div>
      </div>

      {open && alerts.length > 0 && (
        <div className="wx-list">
          {alerts.slice(0, 6).map((a) => (
            <div className="wx-row" key={a.id}>
              <RiskBadge band={a.band}>{a.severity}</RiskBadge>
              <div className="wx-row__body">
                <b>{a.event}</b>
                <span className="muted"> · {a.area}</span>
                {a.headline && <div className="wx-row__head">{a.headline}</div>}
              </div>
            </div>
          ))}
          {alerts.length > 6 && (
            <div className="wx-row muted" style={{ fontSize: '.78rem' }}>
              +{alerts.length - 6} more active in {areaLabel}.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
