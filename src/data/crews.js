// Field crew roster (mock). Drives the deployment optimisation; if this were
// absent the optimiser falls back to zone-level staging (PRD A5 / F9).

export const CREWS = [
  { id: 'C1', name: 'Line Crew Alpha', skill: 'grid', base: { lat: 32.93, lng: -80.02 }, baseName: 'North Charleston Yard', size: 6, equipment: 'Bucket truck, genset' },
  { id: 'C2', name: 'Line Crew Bravo', skill: 'grid', base: { lat: 32.81, lng: -79.86 }, baseName: 'Mount Pleasant Yard', size: 6, equipment: 'Bucket truck' },
  { id: 'C3', name: 'Line Crew Charlie', skill: 'grid', base: { lat: 32.74, lng: -79.93 }, baseName: 'Peninsula Depot', size: 5, equipment: 'Bucket truck, mobile sub' },
  { id: 'C4', name: 'Water Crew Delta', skill: 'water', base: { lat: 32.79, lng: -79.96 }, baseName: 'Ashley River Plant', size: 4, equipment: 'Bypass pumps, genset' },
  { id: 'C5', name: 'Water Crew Echo', skill: 'water', base: { lat: 32.84, lng: -79.91 }, baseName: 'Cooper East Plant', size: 4, equipment: 'Bypass pumps' },
  { id: 'C6', name: 'Rapid Response Foxtrot', skill: 'grid', base: { lat: 32.98, lng: -80.0 }, baseName: 'Goose Creek Staging', size: 5, equipment: 'Bucket truck, chainsaw team' },
  { id: 'C7', name: 'Water Crew Golf', skill: 'water', base: { lat: 32.99, lng: -79.96 }, baseName: 'Bushy Park Plant', size: 4, equipment: 'Bypass pumps, tanker' },
  { id: 'C8', name: 'Damage Assessment Hotel', skill: 'grid', base: { lat: 32.82, lng: -79.95 }, baseName: 'EOC Mobile', size: 3, equipment: 'Drone, survey kit' },
]
