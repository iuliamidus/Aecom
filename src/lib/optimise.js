// Deployment Optimisation (constrained, mock). Recommends a crew → asset staging
// plan that prioritises the highest-risk, highest-impact assets under crew-count
// and travel constraints. Greedy assignment is enough to be credible for a demo.
// HITL: the operator approves/edits/rejects — never auto-dispatched (PRD F5).
// Falls back to zone-level staging when routing data is unavailable (PRD F9).

import { CREWS } from '../data/crews.js'
import { ASSETS, REGIONS } from '../data/assets.js'
import { computeRisk } from './risk.js'
import { distanceKm, round } from './util.js'

const AVG_KMH = 45 // pre-storm road speed assumption for ETA

// Full optimisation: assign each top-priority asset to the nearest available,
// skill-matched crew. Returns ranked recommendations with ETA + impact.
export function optimiseDeployment(clock, { maxAssignments = 8 } = {}) {
  const ranked = ASSETS.map((a) => ({ asset: a, risk: computeRisk(a, clock) }))
    .filter((r) => r.risk.score >= 45)
    .sort((a, b) => b.risk.score * b.asset.customersServed - a.risk.score * a.asset.customersServed)

  const used = new Set()
  const recs = []
  for (const { asset, risk } of ranked) {
    if (recs.length >= maxAssignments) break
    const candidates = CREWS.filter((c) => c.skill === asset.domain && !used.has(c.id))
      .map((c) => ({ crew: c, dist: distanceKm(c.base, asset) }))
      .sort((a, b) => a.dist - b.dist)
    if (!candidates.length) continue
    const { crew, dist } = candidates[0]
    used.add(crew.id)
    const etaMin = round((dist / AVG_KMH) * 60)
    recs.push({
      id: `${crew.id}-${asset.id}`,
      crew,
      asset,
      risk,
      distanceKm: round(dist, 1),
      etaMin,
      // expected restoration-time benefit from pre-staging vs reacting after failure
      benefitHrs: round(2 + risk.score / 12 + asset.criticality, 1),
    })
  }
  return recs
}

// Fallback: no routing data → stage crews by region zone, weighted by aggregate risk.
export function zoneStaging(clock) {
  const zones = REGIONS.map((region) => {
    const inZone = ASSETS.filter((a) => a.region === region)
    const aggRisk =
      inZone.reduce((s, a) => s + computeRisk(a, clock).score, 0) / Math.max(1, inZone.length)
    const customers = inZone.reduce((s, a) => s + a.customersServed, 0)
    return { region, aggRisk: round(aggRisk), customers, assets: inZone.length, crews: 0 }
  }).sort((a, b) => b.aggRisk - a.aggRisk)

  // distribute the 8 crews proportionally to zone risk (at least 1 each)
  let remaining = CREWS.length - zones.length
  const totalRisk = zones.reduce((s, z) => s + z.aggRisk, 0)
  zones.forEach((z) => (z.crews = 1))
  zones.forEach((z) => {
    const extra = Math.round((z.aggRisk / totalRisk) * remaining)
    z.crews += extra
  })
  return zones
}
