import { MapContainer, TileLayer, Polygon, Rectangle, CircleMarker, Tooltip, Circle, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import { stormPosition } from '../data/scenario.js'
import { ASSET_BY_ID } from '../data/assets.js'
import { BAND_META } from '../lib/risk.js'

const BAND_HEX = { critical: '#C0362C', high: '#E8662A', elevated: '#E0A100', low: '#0E8F8C' }
// Match the Dashboard AssetMap so the two views read identically.
const BAND_RADIUS = { critical: 12, high: 10, elevated: 8, low: 6 }

function Recenter({ center, zoom }) {
  const map = useMap()
  useEffect(() => { map.flyTo(center, zoom, { duration: 0.8 }) }, [center, zoom, map])
  return null
}

// Satellite imagery view ("CV from above") with georeferenced detection footprints
// overlaid on the real operating area. Esri World Imagery — no API key required.
export function AerialMap({ detections, selectedId, onSelect, confirmed, clock, center, zoom = 13, assets = [], showAssets = true }) {
  const eye = stormPosition(clock)
  const linkedId = detections.find((d) => d.id === selectedId)?.linkedAssetId
  return (
    <div className="map-wrap" style={{ height: 560 }}>
      <MapContainer center={[center.lat, center.lng]} zoom={zoom} scrollWheelZoom>
        <Recenter center={[center.lat, center.lng]} zoom={zoom} />
        <TileLayer
          attribution="Imagery &copy; Esri, Maxar, Earthstar Geographics"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
        />

        {/* storm influence on the imaged area */}
        <Circle center={[eye.lat, eye.lng]} radius={70000} pathOptions={{ color: '#E8662A', weight: 1, fillOpacity: 0.04 }} />

        {/* detection footprints */}
        {detections.map((d) => {
          const color = BAND_HEX[d.band]
          const sel = d.id === selectedId
          const isConfirmed = confirmed.has(d.id)
          const opts = {
            color: sel ? '#fff' : color,
            weight: sel ? 3 : 2,
            fillColor: color,
            fillOpacity: isConfirmed ? 0.45 : 0.25,
            dashArray: isConfirmed ? null : '5 5',
          }
          const tip = (
            <Tooltip direction="top">
              <b>{d.label}</b><br />{(d.conf * 100).toFixed(0)}% · {d.source}
            </Tooltip>
          )
          return d.geom.type === 'polygon' ? (
            <Polygon key={d.id} positions={d.geom.positions} pathOptions={opts} eventHandlers={{ click: () => onSelect(d.id) }}>{tip}</Polygon>
          ) : (
            <Rectangle key={d.id} bounds={d.geom.bounds} pathOptions={opts} eventHandlers={{ click: () => onSelect(d.id) }}>{tip}</Rectangle>
          )
        })}

        {/* full asset layer (risk-coloured), mirrored from the Dashboard map */}
        {showAssets && assets.map(({ asset, risk }) => {
          const isLinked = asset.id === linkedId
          const color = BAND_META[risk.band].color
          return (
            <CircleMarker
              key={'a' + asset.id}
              center={[asset.lat, asset.lng]}
              radius={BAND_RADIUS[risk.band] + (isLinked ? 4 : 0)}
              pathOptions={{
                color: isLinked ? '#fff' : color,
                weight: isLinked ? 3 : 1.5,
                fillColor: color,
                fillOpacity: 0.85,
              }}
            >
              <Tooltip direction="top" offset={[0, -4]}>
                <b>{asset.name}</b>
                <br />
                {risk.band.toUpperCase()} · {risk.score}/100
                {isLinked && <><br />linked to selected detection</>}
              </Tooltip>
            </CircleMarker>
          )
        })}
      </MapContainer>

      <div className="map-legend">
        <div className="row"><span style={{ width: 14, height: 10, border: '2px dashed #fff', display: 'inline-block' }} /> Detection — unconfirmed</div>
        <div className="row"><span style={{ width: 14, height: 10, background: 'rgba(255,255,255,.4)', border: '1px solid #fff', display: 'inline-block' }} /> Detection — confirmed</div>
        {showAssets && (
          <>
            <div className="row" style={{ marginTop: 4, opacity: 0.85 }}>Asset risk</div>
            {Object.entries(BAND_META).map(([band, m]) => (
              <div className="row" key={band}>
                <span className="risk-dot" style={{ background: m.color }} /> {m.label}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
