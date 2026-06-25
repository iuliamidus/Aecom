import { useMemo, useState } from 'react'
import { useScenario } from '../lib/ScenarioContext.jsx'
import { ASSET_BY_ID, downstreamDependents } from '../data/assets.js'
import { computeRisk, BAND_META } from '../lib/risk.js'
import { formatInt } from '../lib/util.js'
import { PageHead } from '../components/AppShell.jsx'
import { CascadeGraph } from '../components/CascadeGraph.jsx'
import { RiskBadge } from '../components/RiskBadge.jsx'

export function Dependencies() {
  const { clock, addToPlan, plan } = useScenario()
  const [selectedId, setSelectedId] = useState('SS-Battery')

  const selected = ASSET_BY_ID[selectedId]

  const cascade = useMemo(() => {
    const dependents = downstreamDependents(selectedId)
    const ids = new Set([selectedId, ...dependents.map((d) => d.id)])
    // walk the upstream supply chain too, so the whole path lights up
    const upstream = []
    const seen = new Set()
    let cur = ASSET_BY_ID[selectedId]
    while (cur && cur.dependsOn.length && !seen.has(cur.id)) {
      seen.add(cur.id)
      const up = ASSET_BY_ID[cur.dependsOn[0]]
      if (!up) break
      upstream.push(up)
      ids.add(up.id)
      cur = up
    }
    return { dependents, upstream, ids }
  }, [selectedId])

  const risk = computeRisk(selected, clock)
  const water = cascade.dependents.filter((d) => d.domain === 'water')
  const customersDown = cascade.dependents.reduce((s, d) => s + d.customersServed, 0)
  // grid → water service impact is partial (treatment can ride through briefly)
  const propagated = selected.domain === 'grid' ? Math.round(customersDown * 0.4) : customersDown
  const inPlan = plan.includes(selectedId)

  return (
    <>
      <PageHead title="Cross-Domain Dependency Cascade">
        The differentiator: grid and water modelled as one connected system. Click any asset to
        trace how its failure propagates downstream — and how many customers go with it.
      </PageHead>

      <div className="banner banner--hitl">
        <div>
          <b>{selected.name}</b> fails →{' '}
          {cascade.dependents.length === 0 ? (
            <>no downstream dependents recorded.</>
          ) : (
            <>
              <b>{cascade.dependents.length}</b> downstream asset(s) lose their supply
              {water.length > 0 && (
                <>
                  , including <b>{water.length}</b> water asset(s) — a grid fault becoming a
                  water-service outage.
                </>
              )}
            </>
          )}
        </div>
      </div>

      <div className="kpi-strip">
        <div className="kpi">
          <div className="kpi__label">Selected asset risk</div>
          <div className="kpi__num" style={{ color: BAND_META[risk.band].color }}>{risk.score}</div>
          <div className="kpi__sub">{selected.region} · {selected.domain}</div>
        </div>
        <div className="kpi">
          <div className="kpi__label">Downstream dependents</div>
          <div className="kpi__num">{cascade.dependents.length}</div>
          <div className="kpi__sub">{water.length} water · {cascade.dependents.length - water.length} grid</div>
        </div>
        <div className="kpi">
          <div className="kpi__label">Customers downstream</div>
          <div className="kpi__num">{formatInt(customersDown)}</div>
          <div className="kpi__sub">served by dependent assets</div>
        </div>
        <div className="kpi">
          <div className="kpi__label">Propagated impact</div>
          <div className="kpi__num is-risk">{formatInt(propagated)}</div>
          <div className="kpi__sub">est. customers exposed by cascade</div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="panel">
          <div className="panel__head">
            <h3>Dependency network</h3>
            <div className="row" style={{ gap: '.8rem', flexWrap: 'wrap' }}>
              {Object.entries(BAND_META).map(([band, m]) => (
                <span key={band} className="row" style={{ gap: '.3rem', fontSize: '.72rem' }}>
                  <span className="risk-dot" style={{ background: m.color }} /> {m.label}
                </span>
              ))}
            </div>
          </div>
          <CascadeGraph
            clock={clock}
            selectedId={selectedId}
            onSelect={setSelectedId}
            cascadeIds={cascade.ids}
          />
        </div>

        <div className="panel">
          <div className="panel__head">
            <h3>{selected.name}</h3>
            <RiskBadge band={risk.band} />
          </div>
          <div className="panel--pad stack" style={{ gap: '1rem' }}>
            {cascade.upstream.length > 0 && (
              <div>
                <div className="eyebrow-sm" style={{ marginBottom: '.4rem' }}>Supplied by (upstream)</div>
                <div className="cascade">
                  {cascade.upstream.map((u) => (
                    <div key={u.id} className="cascade__node" style={{ cursor: 'pointer' }} onClick={() => setSelectedId(u.id)}>
                      <span className={`risk-dot ${computeRisk(u, clock).band}`} />
                      {u.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="eyebrow-sm" style={{ marginBottom: '.4rem' }}>
                Downstream impact ({cascade.dependents.length})
              </div>
              {cascade.dependents.length === 0 ? (
                <div className="muted" style={{ fontSize: '.82rem' }}>
                  No assets depend on this one — its failure is contained.
                </div>
              ) : (
                <div className="cascade">
                  {cascade.dependents.map((d) => (
                    <div key={d.id} className="cascade__node" style={{ cursor: 'pointer' }} onClick={() => setSelectedId(d.id)}>
                      <span className={`risk-dot ${computeRisk(d, clock).band}`} />
                      <span className={d.domain === 'water' ? 'tag tag--approved' : 'tag'} style={{ fontSize: '.6rem' }}>{d.domain}</span>
                      {d.name} <span className="muted">· {formatInt(d.customersServed)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!inPlan ? (
              <button className="aecom-btn aecom-btn--primary" style={{ alignSelf: 'flex-start' }} onClick={() => addToPlan(selected)}>
                Pre-stage this asset
              </button>
            ) : (
              <span className="tag tag--approved" style={{ alignSelf: 'flex-start', fontSize: '.78rem', padding: '.35rem .7rem' }}>
                ✓ In deployment plan
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
