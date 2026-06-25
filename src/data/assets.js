// Unified cross-domain asset model (mock). One record shape spans grid + water,
// per the PRD's "common asset-risk schema". `dependsOn` encodes the cross-domain
// dependency graph: a pumping station depends on a substation (power); a water
// treatment plant depends on a pumping station. A grid failure therefore cascades
// into water-service impact.

import { mulberry32 } from '../lib/util.js'

export const ASSET_TYPES = {
  substation: { label: 'Substation', domain: 'grid', icon: 'bolt' },
  transmission: { label: 'Transmission node', domain: 'grid', icon: 'tower' },
  water_treatment: { label: 'Water treatment', domain: 'water', icon: 'droplet' },
  pumping: { label: 'Pumping station', domain: 'water', icon: 'pump' },
}

export const REGIONS = ['Coastal', 'Bay', 'Inland']

// Region centres + how exposed each is to storm surge (coastal/bay flood worst).
const REGION_GEO = {
  Coastal: { lat: 32.74, lng: -79.91, spread: 0.05, surge: 1.0 },
  Bay: { lat: 32.82, lng: -79.9, spread: 0.05, surge: 0.7 },
  Inland: { lat: 32.95, lng: -80.02, spread: 0.07, surge: 0.25 },
}

export function regionSurge(region) {
  return REGION_GEO[region]?.surge ?? 0.5
}

// --- Hand-authored flagship assets with explicit dependency chains -----------
// These carry the cross-domain cascade story (grid -> water).
const FLAGSHIP = [
  // Chain A (Coastal): Battery Point SS -> Harborview lift -> Ashley River WTP
  { id: 'SS-Battery', name: 'Battery Point Substation', type: 'substation', region: 'Coastal', lat: 32.745, lng: -79.93, age: 41, condition: 'poor', criticality: 5, customersServed: 96000 },
  { id: 'PS-Harborview', name: 'Harborview Lift Station', type: 'pumping', region: 'Coastal', lat: 32.758, lng: -79.92, age: 22, condition: 'fair', criticality: 4, customersServed: 54000, dependsOn: ['SS-Battery'] },
  { id: 'WT-Ashley', name: 'Ashley River Water Treatment', type: 'water_treatment', region: 'Coastal', lat: 32.79, lng: -79.96, age: 18, condition: 'fair', criticality: 5, customersServed: 210000, dependsOn: ['PS-Harborview'] },
  // Chain B (Bay): Mount Pleasant SS -> Shem Creek PS -> Cooper East WTP
  { id: 'SS-MtPleasant', name: 'Mount Pleasant Substation', type: 'substation', region: 'Bay', lat: 32.81, lng: -79.86, age: 33, condition: 'fair', criticality: 5, customersServed: 88000 },
  { id: 'PS-ShemCreek', name: 'Shem Creek Pump Station', type: 'pumping', region: 'Bay', lat: 32.795, lng: -79.875, age: 27, condition: 'unknown', criticality: 4, customersServed: 47000, dependsOn: ['SS-MtPleasant'] },
  { id: 'WT-CooperEast', name: 'Cooper East Treatment Plant', type: 'water_treatment', region: 'Bay', lat: 32.84, lng: -79.91, age: 24, condition: 'fair', criticality: 5, customersServed: 175000, dependsOn: ['PS-ShemCreek'] },
  // Chain C (Inland backbone): Summerville Tx -> North Charleston SS -> Goose Creek PS -> Inland WTP
  { id: 'TX-Summerville', name: 'Summerville Transmission Node', type: 'transmission', region: 'Inland', lat: 33.0, lng: -80.18, age: 15, condition: 'good', criticality: 5, customersServed: 320000 },
  { id: 'SS-NorthChas', name: 'North Charleston Substation', type: 'substation', region: 'Inland', lat: 32.93, lng: -80.02, age: 29, condition: 'fair', criticality: 5, customersServed: 142000, dependsOn: ['TX-Summerville'] },
  { id: 'PS-GooseCreek', name: 'Goose Creek Pump Station', type: 'pumping', region: 'Inland', lat: 32.98, lng: -80.0, age: 12, condition: 'good', criticality: 3, customersServed: 38000, dependsOn: ['SS-NorthChas'] },
  { id: 'WT-Bushy', name: 'Bushy Park Water Treatment', type: 'water_treatment', region: 'Inland', lat: 32.99, lng: -79.96, age: 9, condition: 'good', criticality: 4, customersServed: 160000, dependsOn: ['PS-GooseCreek'] },
  // Critical coastal transmission feeding Battery Point
  { id: 'TX-Coastal', name: 'James Island Transmission', type: 'transmission', region: 'Coastal', lat: 32.72, lng: -79.95, age: 36, condition: 'poor', criticality: 5, customersServed: 180000 },
]
// James Island feeds Battery Point — link after declaration.
FLAGSHIP.find((a) => a.id === 'SS-Battery').dependsOn = ['TX-Coastal']

// --- Generated fill assets (deterministic) -----------------------------------
const NAMES = {
  Coastal: ['Folly', 'Sullivan', 'Wappoo', 'Stono', 'Morris', 'Kiawah', 'Seabrook'],
  Bay: ['Patriots', 'Daniel', 'Drum', 'Wando', 'Yorktown', 'Remley'],
  Inland: ['Ladson', 'Hanahan', 'Moncks', 'Ridgeville', 'Lincolnville', 'Knightsville', 'Jedburg'],
}
const TYPE_POOL = ['substation', 'transmission', 'water_treatment', 'pumping']

function generateFill(count = 34) {
  const rng = mulberry32(20260625)
  const out = []
  for (let i = 0; i < count; i++) {
    const region = REGIONS[Math.floor(rng() * REGIONS.length)]
    const geo = REGION_GEO[region]
    const type = TYPE_POOL[Math.floor(rng() * TYPE_POOL.length)]
    const meta = ASSET_TYPES[type]
    const place = NAMES[region][Math.floor(rng() * NAMES[region].length)]
    const condRoll = rng()
    const condition =
      condRoll > 0.86 ? 'unknown' : condRoll > 0.62 ? 'poor' : condRoll > 0.32 ? 'fair' : 'good'
    out.push({
      id: `${type === 'water_treatment' ? 'WT' : type === 'pumping' ? 'PS' : type === 'transmission' ? 'TX' : 'SS'}-${region.slice(0, 2).toUpperCase()}${i}`,
      name: `${place} ${meta.label}`,
      type,
      region,
      lat: geo.lat + (rng() - 0.5) * geo.spread * 2,
      lng: geo.lng + (rng() - 0.5) * geo.spread * 2,
      age: Math.round(5 + rng() * 40),
      condition,
      criticality: 1 + Math.floor(rng() * 5),
      customersServed: Math.round(4000 + rng() * 90000),
    })
  }
  return out
}

// Build the final list, attach domain + a couple of generated dependency links.
function build() {
  const all = [...FLAGSHIP, ...generateFill()].map((a) => ({
    ...a,
    domain: ASSET_TYPES[a.type].domain,
    dependsOn: a.dependsOn || [],
  }))
  // Wire some generated water assets to the nearest generated substation in-region
  // so the dependency graph isn't only the flagships.
  const subsByRegion = {}
  all.forEach((a) => {
    if (a.type === 'substation' || a.type === 'transmission') {
      ;(subsByRegion[a.region] ||= []).push(a)
    }
  })
  all.forEach((a) => {
    if ((a.type === 'pumping' || a.type === 'water_treatment') && a.dependsOn.length === 0) {
      const pool = subsByRegion[a.region]
      if (pool && pool.length) {
        a.dependsOn = [pool[Math.floor((a.lat * 1000) % pool.length)].id]
      }
    }
  })
  return all
}

export const ASSETS = build()
export const ASSET_BY_ID = Object.fromEntries(ASSETS.map((a) => [a.id, a]))

// Reverse dependency lookup: assets whose supply chain ultimately includes `id`.
export function downstreamDependents(id, visited = new Set()) {
  const out = []
  for (const a of ASSETS) {
    if (a.dependsOn.includes(id) && !visited.has(a.id)) {
      visited.add(a.id)
      out.push(a)
      out.push(...downstreamDependents(a.id, visited))
    }
  }
  return out
}
