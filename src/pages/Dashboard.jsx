import { useMemo, useState } from 'react'
import { useScenario } from '../lib/ScenarioContext.jsx'
import { ASSETS, ASSET_TYPES, REGIONS } from '../data/assets.js'
import { rankByRisk } from '../lib/risk.js'
import { impactSnapshot } from '../lib/forecast.js'
import { SCENARIO } from '../data/scenario.js'
import { formatInt } from '../lib/util.js'
import { PageHead } from '../components/AppShell.jsx'
import { AssetMap } from '../components/AssetMap.jsx'
import { AssetDetail } from '../components/AssetDetail.jsx'
import { CriticalPriorities } from '../components/CriticalPriorities.jsx'
import { RiskBadge, ConfidenceMeter } from '../components/RiskBadge.jsx'

const REGION_CENTER = {
  all: SCENARIO.center,
  Coastal: { lat: 32.74, lng: -79.91 },
  Bay: { lat: 32.82, lng: -79.9 },
  Inland: { lat: 32.95, lng: -80.02 },
}

const DOMAINS = [
  { key: 'all', label: 'All domains' },
  { key: 'grid', label: 'Grid' },
  { key: 'water', label: 'Water' },
]

export function Dashboard() {
  const { clock, logAction } = useScenario()
  const [region, setRegion] = useState('all')
  const [domain, setDomain] = useState('all')
  const [type, setType] = useState('all')
  const [minScore, setMinScore] = useState(0)
  const [selectedId, setSelectedId] = useState('SS-Battery')

  const scored = useMemo(() => {
    const filtered = ASSETS.filter(
      (a) =>
        (region === 'all' || a.region === region) &&
        (domain === 'all' || a.domain === domain) &&
        (type === 'all' || a.type === type)
    )
    return rankByRisk(filtered, clock).filter((r) => r.risk.score >= minScore)
  }, [region, domain, type, minScore, clock])

  const snapshot = useMemo(() => impactSnapshot(clock, region), [clock, region])
  const criticalCount = scored.filter((s) => s.risk.band === 'critical').length
  const atRisk = scored.filter((s) => s.risk.score >= 30).length
  const priorities = scored.filter((s) => s.risk.score >= 55) // critical + high
  const selected = ASSETS.find((a) => a.id === selectedId)

  return (
    <>
      <PageHead title="EOC Risk Dashboard">
        Single 48-hour-ahead risk view across grid &amp; water. Ranked, explainable and
        live as the forecast evolves — assets re-prioritise automatically.
      </PageHead>

      <div className="kpi-strip">
        <div className="kpi">
          <div className="kpi__label">Assets at risk</div>
          <div className="kpi__num">{atRisk}<span style={{ fontSize: '1rem', color: 'var(--aecom-gray)' }}> / {scored.length}</span></div>
          <div className="kpi__sub">elevated or above</div>
        </div>
        <div className="kpi">
          <div className="kpi__label">Critical now</div>
          <div className="kpi__num is-risk">{criticalCount}</div>
          <div className="kpi__sub">require pre-staging</div>
        </div>
        <div className="kpi">
          <div className="kpi__label">Customers exposed</div>
          <div className="kpi__num">{formatInt(snapshot.affectedNow)}</div>
          <div className="kpi__sub">peak ~{formatInt(snapshot.peakAffected)} at landfall</div>
        </div>
        <div className="kpi">
          <div className="kpi__label">Est. restoration</div>
          <div className="kpi__num">{snapshot.restorationHrs}h</div>
          <div className="kpi__sub">projected at peak</div>
        </div>
      </div>

      {/* filters */}
      <div className="panel" style={{ marginBottom: '1.25rem' }}>
        <div className="filter-bar">
          <div className="filter-field">
            <label>Region</label>
            <select value={region} onChange={(e) => setRegion(e.target.value)}>
              <option value="all">All regions</option>
              {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="filter-field">
            <label>Domain</label>
            <div className="chip-group">
              {DOMAINS.map((d) => (
                <button key={d.key} className={`chip ${domain === d.key ? 'active' : ''}`} onClick={() => setDomain(d.key)}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-field">
            <label>Asset type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="all">All types</option>
              {Object.entries(ASSET_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div className="filter-field" style={{ minWidth: 200 }}>
            <label>Min. risk score: <span className="threshold-val">{minScore}</span></label>
            <input type="range" min="0" max="90" step="5" value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} />
          </div>
          <div className="filter-field">
            <label>Showing</label>
            <b style={{ color: 'var(--aecom-teal)' }}>{scored.length} assets</b>
          </div>
        </div>
      </div>

      <CriticalPriorities
        items={priorities}
        selectedId={selectedId}
        onSelect={setSelectedId}
        logAction={logAction}
      />

      <div className="dash-grid">
        <div className="stack">
          <AssetMap
            scored={scored}
            selectedId={selectedId}
            onSelect={setSelectedId}
            center={REGION_CENTER[region]}
            zoom={region === 'all' ? 11 : 12}
            clock={clock}
          />
          <AssetDetail asset={selected} clock={clock} />
        </div>

        {/* live priority list */}
        <div className="panel">
          <div className="panel__head">
            <h3>Live priority queue</h3>
            <span className="eyebrow-sm">Auto-reorders</span>
          </div>
          <div className="prio-list">
            {scored.map(({ asset, risk }, i) => (
              <div
                key={asset.id}
                className={`prio-row ${asset.id === selectedId ? 'is-selected' : ''}`}
                onClick={() => setSelectedId(asset.id)}
              >
                <div className="prio-row__score" style={{ color: 'var(--risk-' + risk.band + ')' }}>
                  {risk.score}
                </div>
                <div>
                  <div className="prio-row__name"><span className="prio-rank">#{i + 1}</span> {asset.name}</div>
                  <div className="prio-row__meta">
                    <RiskBadge band={risk.band} />
                    <span>{asset.region}</span>
                    <span>· {formatInt(asset.customersServed)} cust.</span>
                  </div>
                  <div style={{ marginTop: 4, maxWidth: 220 }}>
                    <ConfidenceMeter value={risk.confidence} />
                  </div>
                </div>
                <div />
              </div>
            ))}
            {scored.length === 0 && <div className="panel--pad muted">No assets match the current filters.</div>}
          </div>
        </div>
      </div>
    </>
  )
}
