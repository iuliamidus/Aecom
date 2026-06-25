import { MapContainer, TileLayer, CircleMarker, Circle, Tooltip, Polyline, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import { SCENARIO, stormPosition } from '../data/scenario.js'
import { BAND_META } from '../lib/risk.js'

const BAND_RADIUS = { critical: 12, high: 10, elevated: 8, low: 6 }

// Recenter when the region filter changes.
function Recenter({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.8 })
  }, [center, zoom, map])
  return null
}

export function AssetMap({ scored, selectedId, onSelect, center, zoom = 11, clock }) {
  const eye = stormPosition(clock)
  // recent track tail for context
  const tail = [0, 12, 24, 36, 48]
    .filter((t) => t <= clock + 0.01)
    .map((t) => {
      const p = stormPosition(t)
      return [p.lat, p.lng]
    })
  tail.push([eye.lat, eye.lng])

  return (
    <div className="map-wrap">
      <MapContainer center={[center.lat, center.lng]} zoom={zoom} scrollWheelZoom>
        <Recenter center={[center.lat, center.lng]} zoom={zoom} />
        <TileLayer
          attribution='&copy; OpenStreetMap, &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* storm wind field + eye + track */}
        <Circle center={[eye.lat, eye.lng]} radius={70000} pathOptions={{ color: '#E8662A', weight: 1, fillColor: '#E8662A', fillOpacity: 0.08 }} />
        <Circle center={[eye.lat, eye.lng]} radius={28000} pathOptions={{ color: '#C0362C', weight: 1.5, fillColor: '#C0362C', fillOpacity: 0.15 }} />
        <Polyline positions={tail} pathOptions={{ color: '#E8662A', weight: 2, dashArray: '4 6', opacity: 0.7 }} />

        {/* asset markers */}
        {scored.map(({ asset, risk }) => {
          const isSel = asset.id === selectedId
          const color = BAND_META[risk.band].color
          return (
            <CircleMarker
              key={asset.id}
              center={[asset.lat, asset.lng]}
              radius={BAND_RADIUS[risk.band] + (isSel ? 4 : 0)}
              pathOptions={{
                color: isSel ? '#fff' : color,
                weight: isSel ? 3 : 1.5,
                fillColor: color,
                fillOpacity: 0.85,
              }}
              eventHandlers={{ click: () => onSelect(asset.id) }}
            >
              <Tooltip direction="top" offset={[0, -4]}>
                <b>{asset.name}</b>
                <br />
                {risk.band.toUpperCase()} · {risk.score}/100
              </Tooltip>
            </CircleMarker>
          )
        })}
      </MapContainer>

      <div className="map-legend">
        {Object.entries(BAND_META).map(([band, m]) => (
          <div className="row" key={band}>
            <span className="risk-dot" style={{ background: m.color }} /> {m.label}
          </div>
        ))}
        <div className="row" style={{ marginTop: 4, opacity: 0.8 }}>
          <span className="risk-dot" style={{ background: '#C0362C' }} /> {SCENARIO.name} eye
        </div>
      </div>
    </div>
  )
}
