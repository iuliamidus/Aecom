// Predictive Asset Risk Engine (mock, but explainable + time-varying).
// Pure functions of (asset, clock) so the whole UI is deterministic and the
// scenario scrubber can rewind/replay. Every score ships with confidence and
// the contributing factors that produced it — per PRD F2 / objective O3.

import { clamp, round, distanceKm } from './util.js'
import { stormPosition, stormWind } from '../data/scenario.js'
import { regionSurge } from '../data/assets.js'

// Static vulnerability from age + condition (0..1). Unknown condition is treated
// as a first-class case: mid vulnerability but lowered confidence (graceful
// degradation on dirty data, PRD §3).
function vulnerability(asset) {
  const ageScore = clamp(asset.age / 45)
  const condScore =
    asset.condition === 'poor' ? 0.9 :
    asset.condition === 'fair' ? 0.55 :
    asset.condition === 'good' ? 0.2 :
    0.55 // unknown
  return clamp(0.45 * ageScore + 0.55 * condScore)
}

// Time-varying hazard exposure for an asset (0..1): how hard the storm is hitting
// it right now. Combines proximity to the eye with the region's surge exposure.
export function hazardLevel(asset, clock) {
  const eye = stormPosition(clock)
  const d = distanceKm(eye, { lat: asset.lat, lng: asset.lng })
  // wind field ~140km radius; closer = higher. Scales with storm intensity.
  const intensity = stormWind(clock) / 125
  const wind = clamp(1 - d / 140) * intensity
  // surge builds in the last ~18h for low-lying coastal/bay assets
  const surgePhase = clamp((clock - 30) / 18)
  const surge = regionSurge(asset.region) * surgePhase
  return clamp(0.65 * wind + 0.45 * surge)
}

// Confidence (0..1): high when we trust the inputs; dented by unknown condition
// and by very old records.
function confidence(asset) {
  let c = 0.92
  if (asset.condition === 'unknown') c -= 0.27
  if (asset.age > 35) c -= 0.08
  return clamp(c, 0.45, 0.97)
}

export function riskBand(score) {
  if (score >= 75) return 'critical'
  if (score >= 55) return 'high'
  if (score >= 30) return 'elevated'
  return 'low'
}

export const BAND_META = {
  critical: { label: 'Critical', color: '#C0362C' },
  high: { label: 'High', color: '#E8662A' },
  elevated: { label: 'Elevated', color: '#E0A100' },
  low: { label: 'Nominal', color: '#0E8F8C' },
}

// The full explainable risk record for an asset at a given clock.
export function computeRisk(asset, clock) {
  const vuln = vulnerability(asset)
  const hazard = hazardLevel(asset, clock)
  const crit = (asset.criticality - 1) / 4

  // Weighted contributions (the factors), summing to the score.
  const cHazard = 50 * hazard
  const cVuln = 30 * vuln
  const cCrit = 20 * crit
  const score = round(clamp(cHazard + cVuln + cCrit, 0, 100))

  const factors = [
    { label: 'Forecast hazard exposure (wind + surge)', weight: round(cHazard) },
    { label: `Asset condition & age (${asset.condition}, ${asset.age}y)`, weight: round(cVuln) },
    { label: `Criticality & customers served`, weight: round(cCrit) },
  ].sort((a, b) => b.weight - a.weight)

  return {
    score,
    band: riskBand(score),
    confidence: round(confidence(asset) * 100),
    factors,
    hazard: round(hazard * 100),
    // probability of failure used by the impact forecast
    pFail: clamp((score / 100) ** 1.6),
  }
}

// Convenience: compute risk for many assets and rank them.
export function rankByRisk(assets, clock) {
  return assets
    .map((a) => ({ asset: a, risk: computeRisk(a, clock) }))
    .sort((x, y) => y.risk.score - x.risk.score)
}
