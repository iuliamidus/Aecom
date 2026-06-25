import { useMemo, useState } from 'react'
import { useScenario } from '../lib/ScenarioContext.jsx'
import { tMinusLabel } from '../lib/util.js'
import { ASSET_BY_ID, ASSETS } from '../data/assets.js'
import { rankByRisk } from '../lib/risk.js'
import { PageHead } from '../components/AppShell.jsx'
import { AerialMap } from '../components/AerialMap.jsx'
import { RiskBadge } from '../components/RiskBadge.jsx'
import { IconEye } from '../components/icons.jsx'

// Georeferenced detection footprints over the real operating area (satellite survey).
const DETECTIONS = [
  {
    id: 'D1', label: 'Storm-surge inundation', kind: 'Flood extent', band: 'critical', conf: 0.91,
    source: 'Sentinel-2 (10m)', model: 'cv-flood-seg v0.9', capturedAgoH: 1.5, areaKm2: 2.4,
    linkedAssetId: 'SS-Battery', note: 'Standing water around substation pad; access road partially submerged.',
    geom: { type: 'polygon', positions: [[32.752, -79.945], [32.749, -79.927], [32.739, -79.924], [32.735, -79.94], [32.743, -79.95]] },
  },
  {
    id: 'D2', label: 'Debris on access road', kind: 'Obstruction', band: 'elevated', conf: 0.66,
    source: 'Drone sortie 0214', model: 'cv-damage v0.9', capturedAgoH: 0.5, areaKm2: 0.1,
    linkedAssetId: 'PS-Harborview', note: 'Downed vegetation blocking the only paved approach.',
    geom: { type: 'rect', bounds: [[32.756, -79.924], [32.760, -79.917]] },
  },
  {
    id: 'D3', label: 'Structural / roof damage', kind: 'Damage', band: 'high', conf: 0.79,
    source: 'Drone sortie 0216', model: 'cv-damage v0.9', capturedAgoH: 0.3, areaKm2: 0.2,
    linkedAssetId: 'SS-MtPleasant', note: 'Partial roof loss on the control building; equipment exposure likely.',
    geom: { type: 'rect', bounds: [[32.807, -79.864], [32.813, -79.856]] },
  },
  {
    id: 'D4', label: 'Plant inundation risk', kind: 'Flood extent', band: 'high', conf: 0.83,
    source: 'Sentinel-2 (10m)', model: 'cv-flood-seg v0.9', capturedAgoH: 1.5, areaKm2: 1.1,
    linkedAssetId: 'WT-Ashley', note: 'Rising water within 120m of the intake; surge model agrees.',
    geom: { type: 'polygon', positions: [[32.793, -79.966], [32.792, -79.955], [32.786, -79.954], [32.785, -79.965]] },
  },
  {
    id: 'D5', label: 'Vegetation encroachment', kind: 'Vegetation', band: 'elevated', conf: 0.74,
    source: 'Satellite NDVI', model: 'cv-veg v0.8', capturedAgoH: 6, areaKm2: 0.6,
    linkedAssetId: 'SS-NorthChas', note: 'Canopy within fall-distance of the feeder line.',
    geom: { type: 'rect', bounds: [[32.926, -80.026], [32.934, -80.014]] },
  },
]

const COASTAL_CENTER = { lat: 32.77, lng: -79.93 }

// Drone close-up inspection imagery (secondary tab).
const INSPECTION = [
  {
    id: 'coastal', label: 'Coastal sector — surge ingress', img: '/img/hurricane.png',
    detections: [
      { x: 12, y: 30, w: 34, h: 28, band: 'critical', label: 'Flood extent 72%', conf: 0.91 },
      { x: 58, y: 52, w: 22, h: 20, band: 'high', label: 'Structural damage', conf: 0.78 },
      { x: 70, y: 18, w: 18, h: 16, band: 'elevated', label: 'Debris on access road', conf: 0.66 },
    ],
  },
  {
    id: 'inland', label: 'Inland corridor — vegetation & wildfire', img: '/img/wildfire.webp',
    detections: [
      { x: 20, y: 22, w: 28, h: 30, band: 'high', label: 'Vegetation encroachment', conf: 0.84 },
      { x: 60, y: 40, w: 26, h: 24, band: 'critical', label: 'Active fire front', conf: 0.88 },
    ],
  },
  {
    id: 'substation', label: 'Substation inspection — transformer', img: '/img/infrastructure.jpg',
    detections: [
      { x: 30, y: 35, w: 24, h: 26, band: 'elevated', label: 'Transformer hotspot', conf: 0.72 },
      { x: 64, y: 55, w: 18, h: 16, band: 'high', label: 'Insulator damage', conf: 0.81 },
    ],
  },
]

const BAND_HEX = { critical: '#C0362C', high: '#E8662A', elevated: '#E0A100', low: '#0E8F8C' }

export function Aerial() {
  const { clock, logAction } = useScenario()
  const [tab, setTab] = useState('survey')
  const [selectedId, setSelectedId] = useState('D1')
  const [confirmed, setConfirmed] = useState(new Set())
  const [sceneId, setSceneId] = useState('coastal')
  const [showBoxes, setShowBoxes] = useState(true)
  const [showAssets, setShowAssets] = useState(true)

  const selected = DETECTIONS.find((d) => d.id === selectedId)
  const scene = INSPECTION.find((s) => s.id === sceneId)
  // All assets ranked by current risk — same source as the EOC map, overlaid here.
  const scored = useMemo(() => rankByRisk(ASSETS, clock), [clock])

  const confirm = (d) => {
    setConfirmed((s) => new Set(s).add(d.id))
    const asset = ASSET_BY_ID[d.linkedAssetId]
    logAction('Confirmed CV detection', `${d.label} at ${asset?.name || d.linkedAssetId} (${(d.conf * 100).toFixed(0)}%) — fed to impact forecast`)
  }

  return (
    <>
      <PageHead title="Aerial / Computer-Vision View">
        Satellite and drone imagery analysed from above — flood extent, structural damage and
        vegetation detection, georeferenced to assets and fed into the impact forecast.
      </PageHead>

      <div className="banner banner--hitl">
        <IconEye />
        <div>
          <b>Phase 2 capability (preview).</b> Detections are surfaced for human review and must be
          confirmed before they influence the forecast — never auto-actioned.
        </div>
      </div>

      <div className="filter-bar panel" style={{ marginBottom: '1.25rem', justifyContent: 'space-between' }}>
        <div className="seg">
          <button className={tab === 'survey' ? 'active' : ''} onClick={() => setTab('survey')}>Aerial survey (satellite)</button>
          <button className={tab === 'inspection' ? 'active' : ''} onClick={() => setTab('inspection')}>Asset inspection (drone)</button>
        </div>
        <div className="row" style={{ gap: '1rem', alignItems: 'center' }}>
          {tab === 'survey' && (
            <label className="row" style={{ gap: '.4rem', fontSize: '.8rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={showAssets} onChange={(e) => setShowAssets(e.target.checked)} /> Asset risk overlay
            </label>
          )}
          <span className="muted" style={{ fontSize: '.8rem' }}>
            {tab === 'survey'
              ? `Imagery refreshed ${tMinusLabel(clock)} · ${DETECTIONS.length} detections`
              : 'Close-up frames from crew & drone sorties'}
          </span>
        </div>
      </div>

      {tab === 'survey' ? (
        <div className="grid-2" style={{ gridTemplateColumns: '1fr 360px' }}>
          <AerialMap
            detections={DETECTIONS}
            selectedId={selectedId}
            onSelect={setSelectedId}
            confirmed={confirmed}
            clock={clock}
            center={COASTAL_CENTER}
            assets={scored}
            showAssets={showAssets}
          />

          <div className="stack">
            <div className="panel">
              <div className="panel__head">
                <h3>Detections</h3>
                <span className="eyebrow-sm">{confirmed.size}/{DETECTIONS.length} confirmed</span>
              </div>
              <div className="prio-list" style={{ maxHeight: 230 }}>
                {DETECTIONS.map((d) => (
                  <div
                    key={d.id}
                    className={`prio-row ${d.id === selectedId ? 'is-selected' : ''}`}
                    style={{ gridTemplateColumns: '1fr auto' }}
                    onClick={() => setSelectedId(d.id)}
                  >
                    <div>
                      <div className="prio-row__name">{d.label}</div>
                      <div className="prio-row__meta">
                        <RiskBadge band={d.band} /> <span>· {(d.conf * 100).toFixed(0)}%</span>
                        {confirmed.has(d.id) && <span className="tag tag--approved">confirmed</span>}
                      </div>
                    </div>
                    <span className="muted" style={{ fontSize: '.72rem' }}>{d.kind}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* selected detection detail + confirm action */}
            {selected && (
              <div className="panel">
                <div className="panel__head" style={{ borderTop: `3px solid ${BAND_HEX[selected.band]}` }}>
                  <h3>{selected.label}</h3>
                  <RiskBadge band={selected.band} />
                </div>
                <div className="panel--pad" style={{ display: 'flex', flexDirection: 'column', gap: '.7rem' }}>
                  <p style={{ margin: 0, fontSize: '.88rem' }}>{selected.note}</p>
                  <div className="det-meta">
                    <div><span className="eyebrow-sm">Confidence</span><b>{(selected.conf * 100).toFixed(0)}%</b></div>
                    <div><span className="eyebrow-sm">Source</span><b>{selected.source}</b></div>
                    <div><span className="eyebrow-sm">Model</span><b>{selected.model}</b></div>
                    <div><span className="eyebrow-sm">Captured</span><b>{selected.capturedAgoH}h ago</b></div>
                    <div><span className="eyebrow-sm">Area</span><b>{selected.areaKm2} km²</b></div>
                    <div><span className="eyebrow-sm">Linked asset</span><b>{ASSET_BY_ID[selected.linkedAssetId]?.name}</b></div>
                  </div>
                  {confirmed.has(selected.id) ? (
                    <div className="banner banner--hitl" style={{ margin: 0 }}>
                      <b>Confirmed.</b> Detection is feeding the impact forecast and the linked asset's risk.
                    </div>
                  ) : (
                    <button className="aecom-btn aecom-btn--primary" style={{ alignSelf: 'flex-start' }} onClick={() => confirm(selected)}>
                      Confirm &amp; feed to impact
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid-2" style={{ gridTemplateColumns: '1fr 340px' }}>
          <div>
            <div className="chip-group" style={{ marginBottom: '.75rem' }}>
              {INSPECTION.map((s) => (
                <button key={s.id} className={`chip ${sceneId === s.id ? 'active' : ''}`} onClick={() => setSceneId(s.id)}>
                  {s.label}
                </button>
              ))}
            </div>
            <div className="aerial-stage">
              <img src={scene.img} alt={scene.label} />
              {showBoxes && scene.detections.map((d, i) => (
                <div key={i} className="cv-box" style={{ left: `${d.x}%`, top: `${d.y}%`, width: `${d.w}%`, height: `${d.h}%`, borderColor: BAND_HEX[d.band] }}>
                  <span className="cv-box__label" style={{ background: BAND_HEX[d.band] }}>{d.label} · {(d.conf * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="panel">
            <div className="panel__head">
              <h3>Frame findings</h3>
              <label className="row" style={{ gap: '.4rem', fontSize: '.8rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={showBoxes} onChange={(e) => setShowBoxes(e.target.checked)} /> Boxes
              </label>
            </div>
            <div className="prio-list" style={{ maxHeight: 420 }}>
              {scene.detections.map((d, i) => (
                <div className="prio-row" key={i} style={{ cursor: 'default', gridTemplateColumns: '1fr auto' }}>
                  <div>
                    <div className="prio-row__name">{d.label}</div>
                    <div className="prio-row__meta"><RiskBadge band={d.band} /> <span>· {(d.conf * 100).toFixed(0)}%</span></div>
                  </div>
                  <button className="btn-sm btn-edit">Review</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
