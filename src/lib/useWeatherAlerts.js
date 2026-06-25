// Live weather feed (PRD §8): the National Weather Service public alerts API is
// the real-world hazard trigger for the platform. Free, no API key, CORS-enabled.
// We cache the last-good response and surface staleness — exactly the degradation
// behaviour the PRD requires when the upstream feed is slow or unreachable.

import { useEffect, useRef, useState } from 'react'

const CACHE_KEY = 'sgw.nws.alerts.v1'
const REFRESH_MS = 5 * 60 * 1000 // NWS data updates on the order of minutes

// NWS severity → our internal risk-band ramp, so alerts read in the same visual
// language as asset risk across the app.
export const NWS_SEVERITY_BAND = {
  Extreme: 'critical',
  Severe: 'high',
  Moderate: 'elevated',
  Minor: 'low',
  Unknown: 'low',
}

const SEVERITY_ORDER = { Extreme: 0, Severe: 1, Moderate: 2, Minor: 3, Unknown: 4 }

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function normalise(features = []) {
  return features
    .map((f) => ({
      id: f.id,
      event: f.properties?.event || 'Weather alert',
      severity: f.properties?.severity || 'Unknown',
      band: NWS_SEVERITY_BAND[f.properties?.severity] || 'low',
      headline: f.properties?.headline || '',
      area: f.properties?.areaDesc || '',
      sender: f.properties?.senderName || 'NWS',
      effective: f.properties?.effective || null,
      expires: f.properties?.expires || null,
    }))
    .sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 4) - (SEVERITY_ORDER[b.severity] ?? 4))
}

// status: 'loading' | 'live' | 'cached' | 'error'
export function useWeatherAlerts(area = 'SC') {
  const [state, setState] = useState(() => {
    const cached = readCache()
    return cached
      ? { alerts: cached.alerts, fetchedAt: cached.fetchedAt, status: 'cached', error: null }
      : { alerts: [], fetchedAt: null, status: 'loading', error: null }
  })
  const timer = useRef(null)

  useEffect(() => {
    let cancelled = false
    const url = `https://api.weather.gov/alerts/active?area=${area}`

    async function load() {
      try {
        const res = await fetch(url, { headers: { Accept: 'application/geo+json' } })
        if (!res.ok) throw new Error(`NWS responded ${res.status}`)
        const json = await res.json()
        if (cancelled) return
        const alerts = normalise(json.features)
        const fetchedAt = Date.now()
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ alerts, fetchedAt }))
        } catch {
          /* storage full / unavailable — non-fatal */
        }
        setState({ alerts, fetchedAt, status: 'live', error: null })
      } catch (err) {
        if (cancelled) return
        // Graceful degradation: fall back to last-good cache and flag staleness.
        const cached = readCache()
        setState((prev) => ({
          alerts: cached?.alerts ?? prev.alerts,
          fetchedAt: cached?.fetchedAt ?? prev.fetchedAt,
          status: cached || prev.fetchedAt ? 'cached' : 'error',
          error: err.message,
        }))
      }
    }

    load()
    timer.current = setInterval(load, REFRESH_MS)
    return () => {
      cancelled = true
      clearInterval(timer.current)
    }
  }, [area])

  return state
}
