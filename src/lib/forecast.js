// Impact & Outage Forecasting (time-series, mock). Projects customers affected and
// estimated restoration hours across the 48-hour window, with a confidence band.
// Derived from the aggregate asset-risk state — PRD F4 / objective O1.

import { ASSETS, downstreamDependents } from '../data/assets.js'
import { computeRisk } from './risk.js'
import { round } from './util.js'

// Customers affected at a given clock = sum over assets of expected lost service,
// including water customers knocked out by upstream grid failures (cross-domain).
function customersAffectedAt(clock, regionFilter = 'all') {
  let total = 0
  for (const a of ASSETS) {
    if (regionFilter !== 'all' && a.region !== regionFilter) continue
    const { pFail } = computeRisk(a, clock)
    if (pFail < 0.15) continue
    let lost = a.customersServed * pFail
    // cascade: if a grid asset is likely to fail, a share of dependent water
    // customers lose service too
    if (a.domain === 'grid') {
      for (const dep of downstreamDependents(a.id)) {
        lost += dep.customersServed * pFail * 0.4
      }
    }
    total += lost
  }
  return total
}

// Full 48h curve (hourly). `now` marks the current clock for the UI reference line.
export function buildForecast(now, regionFilter = 'all') {
  const points = []
  let cumulativeOutageHrs = 0
  for (let t = 0; t <= 48; t += 1) {
    const affected = customersAffectedAt(t, regionFilter)
    cumulativeOutageHrs += affected / 100000 // rough crew-hours proxy
    const band = affected * 0.16
    points.push({
      hour: t,
      label: t === 0 ? 'T-48' : t === 48 ? 'Landfall' : `T-${48 - t}`,
      affected: round(affected),
      low: round(Math.max(0, affected - band)),
      high: round(affected + band),
      restorationHrs: round(8 + cumulativeOutageHrs * 1.4, 1),
      isNow: t === Math.round(now),
    })
  }
  return points
}

// Single headline snapshot for KPI strips.
export function impactSnapshot(clock, regionFilter = 'all') {
  const affected = customersAffectedAt(clock, regionFilter)
  // peak over the remaining window
  let peak = 0
  for (let t = Math.round(clock); t <= 48; t++) {
    peak = Math.max(peak, customersAffectedAt(t, regionFilter))
  }
  return {
    affectedNow: round(affected),
    peakAffected: round(peak),
    restorationHrs: round(8 + (peak / 100000) * 1.4 * 12, 0),
  }
}
