// Hurricane scenario definition. The storm approaches SGW's coastal region
// from the Atlantic (south-east) and makes landfall at clock = 48.
// All "real-time" behaviour in the app derives from the clock + this track.

export const SCENARIO = {
  name: 'Hurricane Delphine',
  category: 3,
  client: 'Southeastern Grid & Water',
  region: 'Charleston Coastal Operating Area',
  // map centre roughly over the operating area
  center: { lat: 32.82, lng: -79.95 },
  landfall: { lat: 32.71, lng: -79.93 },
  // start (T-48h) far offshore to landfall (T-0)
  trackStart: { lat: 30.9, lng: -78.05 },
}

// Storm eye position interpolated along a gentle NW curve for the given clock (0..48).
export function stormPosition(clock) {
  const t = Math.max(0, Math.min(48, clock)) / 48
  const { trackStart, landfall } = SCENARIO
  // ease-in so it accelerates toward landfall, plus a slight westward bow
  const e = t * t * (3 - 2 * t)
  const lat = trackStart.lat + (landfall.lat - trackStart.lat) * e
  const lng = trackStart.lng + (landfall.lng - trackStart.lng) * e - Math.sin(t * Math.PI) * 0.25
  return { lat, lng }
}

// Sustained wind (mph) ramps up as the eye nears the coast.
export function stormWind(clock) {
  const t = Math.max(0, Math.min(48, clock)) / 48
  return Math.round(75 + 50 * t * t) // ~75 -> ~125 mph (Cat 3)
}

// A few labelled milestones for the timeline UI.
export const MILESTONES = [
  { clock: 0, label: 'Forecast trigger', note: 'NOAA advisory: Cat-3 track toward coast' },
  { clock: 18, label: 'Tropical-storm winds', note: 'Outer bands reach coastal assets' },
  { clock: 32, label: 'Surge watch', note: 'Coastal & bay flooding risk rises' },
  { clock: 42, label: 'Pre-landfall window closes', note: 'Last safe crew staging window' },
  { clock: 48, label: 'Landfall', note: 'Eye crosses the coast' },
]
