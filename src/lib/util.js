// Small deterministic helpers shared across the mock data + simulation layer.

// Deterministic PRNG (mulberry32) so the whole demo is reproducible.
export function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v))
export const lerp = (a, b, t) => a + (b - a) * t
export const round = (v, n = 0) => {
  const f = 10 ** n
  return Math.round(v * f) / f
}

// Rough great-circle-ish distance in km for our small coastal region.
export function distanceKm(a, b) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function formatInt(n) {
  return Math.round(n).toLocaleString('en-US')
}

// Convert a 0..48 clock into a human "T-minus" label.
export function tMinusLabel(clock) {
  const remaining = Math.max(0, 48 - clock)
  if (remaining <= 0) return 'LANDFALL'
  const h = Math.floor(remaining)
  const m = Math.round((remaining - h) * 60)
  return `T−${h}h ${String(m).padStart(2, '0')}m`
}
