import { useMemo, useState } from 'react'
import { useScenario } from '../lib/ScenarioContext.jsx'
import { optimiseDeployment, zoneStaging } from '../lib/optimise.js'
import { computeRisk } from '../lib/risk.js'
import { ASSET_BY_ID } from '../data/assets.js'
import { CREWS } from '../data/crews.js'
import { distanceKm, formatInt, round } from '../lib/util.js'
import { PageHead } from '../components/AppShell.jsx'
import { RiskBadge } from '../components/RiskBadge.jsx'
import { IconShield } from '../components/icons.jsx'

const AVG_KMH = 45

export function Deployment() {
  const { clock, audit, logAction, plan, removeFromPlan } = useScenario()
  const [routingAvailable, setRoutingAvailable] = useState(true)
  const [decisions, setDecisions] = useState({}) // recId -> 'approved' | 'rejected'

  const recs = useMemo(() => optimiseDeployment(clock), [clock])
  const zones = useMemo(() => zoneStaging(clock), [clock])

  // Assets the operator staged from the dashboard — assign each the nearest crew.
  const planned = useMemo(
    () =>
      plan
        .map((id) => ASSET_BY_ID[id])
        .filter(Boolean)
        .map((asset) => {
          const risk = computeRisk(asset, clock)
          const nearest = CREWS.filter((c) => c.skill === asset.domain)
            .map((c) => ({ c, d: distanceKm(c.base, asset) }))
            .sort((a, b) => a.d - b.d)[0]
          return {
            asset,
            risk,
            crew: nearest?.c,
            etaMin: nearest ? round((nearest.d / AVG_KMH) * 60) : null,
          }
        }),
    [plan, clock]
  )

  const decide = (rec, verdict) => {
    setDecisions((d) => ({ ...d, [rec.id]: verdict }))
    logAction(
      verdict === 'approved' ? 'Approved crew deployment' : 'Rejected recommendation',
      `${rec.crew.name} → ${rec.asset.name} (risk ${rec.risk.score}, ETA ${rec.etaMin}m)`
    )
  }

  const approvedCount = Object.values(decisions).filter((v) => v === 'approved').length

  return (
    <>
      <PageHead title="Crew Deployment Plan">
        Optimised crew-to-asset staging that minimises expected restoration time under crew
        and travel constraints. Every recommendation is advisory until you act on it.
      </PageHead>

      <div className="banner banner--hitl">
        <IconShield />
        <div>
          <b>AI recommends, humans decide.</b> No crew is dispatched automatically. Approve, edit
          or reject each recommendation — every action is logged with the model version that
          produced it.
        </div>
      </div>

      <div className="kpi-strip">
        <div className="kpi">
          <div className="kpi__label">Recommendations</div>
          <div className="kpi__num">{routingAvailable ? recs.length : zones.reduce((s, z) => s + z.crews, 0)}</div>
          <div className="kpi__sub">{routingAvailable ? 'asset-level assignments' : 'zone staging allocations'}</div>
        </div>
        <div className="kpi">
          <div className="kpi__label">Approved</div>
          <div className="kpi__num" style={{ color: 'var(--aecom-green-600)' }}>{approvedCount}</div>
          <div className="kpi__sub">crews committed</div>
        </div>
        <div className="kpi">
          <div className="kpi__label">Avg. ETA</div>
          <div className="kpi__num">{recs.length ? Math.round(recs.reduce((s, r) => s + r.etaMin, 0) / recs.length) : 0}m</div>
          <div className="kpi__sub">pre-storm road speed</div>
        </div>
        <div className="kpi">
          <div className="kpi__label">Routing data</div>
          <div className="kpi__num" style={{ color: routingAvailable ? 'var(--risk-low)' : 'var(--risk-elevated)' }}>
            {routingAvailable ? 'Live' : 'Down'}
          </div>
          <div className="kpi__sub">{routingAvailable ? 'optimiser active' : 'fallback engaged'}</div>
        </div>
      </div>

      {/* operator-staged assets (added from the dashboard) */}
      <div className="panel" style={{ marginBottom: '1.25rem', borderTop: '3px solid var(--aecom-green)' }}>
        <div className="panel__head">
          <h3>
            Operator-staged assets
            <span className="count-badge" style={{ background: 'var(--aecom-green)' }}>{planned.length}</span>
          </h3>
          <span className="eyebrow-sm">Added from the dashboard</span>
        </div>
        {planned.length === 0 ? (
          <div className="panel--pad muted">
            No assets staged yet. On the <b>EOC Dashboard</b>, select an asset and choose
            <b> “Add to deployment plan”</b> — staged assets appear here for crew assignment.
          </div>
        ) : (
          <div className="scroll-x">
            <table className="dtable">
              <thead>
                <tr><th>Asset</th><th>Risk</th><th>Suggested crew</th><th>ETA</th><th>Action</th></tr>
              </thead>
              <tbody>
                {planned.map((p) => {
                  const key = 'plan-' + p.asset.id
                  return (
                    <tr key={key}>
                      <td><b>{p.asset.name}</b><br /><small className="muted">{p.asset.region} · {formatInt(p.asset.customersServed)} cust.</small></td>
                      <td><RiskBadge band={p.risk.band}>{p.risk.score}</RiskBadge></td>
                      <td>{p.crew ? p.crew.name : '—'}<br /><small className="muted">{p.crew?.baseName}</small></td>
                      <td>{p.etaMin != null ? `${p.etaMin}m` : '—'}</td>
                      <td>
                        {decisions[key] ? (
                          <span className="tag tag--approved">approved</span>
                        ) : (
                          <div className="row" style={{ gap: '.3rem' }}>
                            <button className="btn-sm btn-approve" onClick={() => { setDecisions((d) => ({ ...d, [key]: 'approved' })); logAction('Approved crew deployment', `${p.crew?.name || 'crew'} → ${p.asset.name} (operator-staged)`) }}>Approve</button>
                            <button className="btn-sm btn-reject" onClick={() => removeFromPlan(p.asset.id)}>Remove</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* fallback toggle (F9) */}
      <div className="panel filter-bar" style={{ marginBottom: '1.25rem', justifyContent: 'space-between' }}>
        <div className="row" style={{ gap: '.6rem' }}>
          <label className="row" style={{ gap: '.5rem', fontWeight: 600, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={!routingAvailable}
              onChange={(e) => setRoutingAvailable(!e.target.checked)}
            />
            Simulate routing/ETA service unavailable
          </label>
        </div>
        <span className="muted" style={{ fontSize: '.8rem' }}>
          Demonstrates F9 — graceful fallback to zone-level staging.
        </span>
      </div>

      {!routingAvailable && (
        <div className="banner banner--warn">
          Routing/ETA service unavailable — optimiser has degraded to <b>zone-level staging</b>.
          Crews are pre-positioned by region risk rather than assigned to specific assets.
        </div>
      )}

      <div className="grid-2" style={{ gridTemplateColumns: '1fr 360px' }}>
        <div className="panel">
          <div className="panel__head">
            <h3>{routingAvailable ? 'Recommended assignments' : 'Zone staging allocation'}</h3>
            <span className="eyebrow-sm">Updated to T-{Math.max(0, 48 - Math.round(clock))}h</span>
          </div>
          <div className="scroll-x">
            {routingAvailable ? (
              <table className="dtable">
                <thead>
                  <tr>
                    <th>Crew</th><th>Asset</th><th>Risk</th><th>ETA</th><th>Benefit</th><th>Decision</th>
                  </tr>
                </thead>
                <tbody>
                  {recs.map((r) => (
                    <tr key={r.id}>
                      <td><b>{r.crew.name}</b><br /><small className="muted">{r.crew.baseName}</small></td>
                      <td>{r.asset.name}<br /><small className="muted">{r.asset.region} · {formatInt(r.asset.customersServed)} cust.</small></td>
                      <td><RiskBadge band={r.risk.band}>{r.risk.score}</RiskBadge></td>
                      <td>{r.etaMin}m<br /><small className="muted">{r.distanceKm}km</small></td>
                      <td>~{r.benefitHrs}h</td>
                      <td>
                        {decisions[r.id] ? (
                          <span className={`tag tag--${decisions[r.id]}`}>{decisions[r.id]}</span>
                        ) : (
                          <div className="row" style={{ gap: '.3rem' }}>
                            <button className="btn-sm btn-approve" onClick={() => decide(r, 'approved')}>Approve</button>
                            <button className="btn-sm btn-reject" onClick={() => decide(r, 'rejected')}>Reject</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="dtable">
                <thead>
                  <tr><th>Zone</th><th>Aggregate risk</th><th>Customers</th><th>Assets</th><th>Crews staged</th></tr>
                </thead>
                <tbody>
                  {zones.map((z) => (
                    <tr key={z.region}>
                      <td><b>{z.region}</b></td>
                      <td>{z.aggRisk}</td>
                      <td>{formatInt(z.customers)}</td>
                      <td>{z.assets}</td>
                      <td><b style={{ color: 'var(--aecom-teal)' }}>{z.crews}</b></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* audit drawer */}
        <div className="panel">
          <div className="panel__head">
            <h3>Audit log</h3>
            <span className="eyebrow-sm">{audit.length} entries</span>
          </div>
          <div className="prio-list" style={{ maxHeight: 520 }}>
            {audit.map((a) => (
              <div className="audit-row" key={a.id}>
                <time>T-{Math.max(0, 48 - a.clock)}h<br />{a.time}</time>
                <div>
                  <b>{a.action}</b>
                  <div><small>{a.detail}</small></div>
                  <div><small className="muted">{a.user} · {a.model}</small></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
