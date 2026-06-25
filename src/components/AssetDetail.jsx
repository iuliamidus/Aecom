import { Link } from 'react-router-dom'
import { computeRisk, BAND_META } from '../lib/risk.js'
import { downstreamDependents, ASSET_BY_ID } from '../data/assets.js'
import { useScenario } from '../lib/ScenarioContext.jsx'
import { RiskBadge, ConfidenceMeter } from './RiskBadge.jsx'
import { formatInt } from '../lib/util.js'
import { IconTruck } from './icons.jsx'

export function AssetDetail({ asset, clock }) {
  const { plan, addToPlan, removeFromPlan } = useScenario()
  if (!asset) {
    return (
      <div className="panel panel--pad muted" style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
        Select an asset on the map or list to see its risk breakdown, confidence and
        cross-domain dependencies.
      </div>
    )
  }
  const risk = computeRisk(asset, clock)
  const color = BAND_META[risk.band].color
  const inPlan = plan.includes(asset.id)
  const dependents = downstreamDependents(asset.id)
  const upstream = asset.dependsOn.map((id) => ASSET_BY_ID[id]).filter(Boolean)
  const waterDependents = dependents.filter((d) => d.domain === 'water')
  const affectedDownstream = dependents.reduce((s, d) => s + d.customersServed, 0)

  return (
    <div className="panel">
      <div className="panel__head">
        <div>
          <h3>{asset.name}</h3>
          <span className="eyebrow-sm">{asset.id} · {asset.region}</span>
        </div>
        <RiskBadge band={risk.band} />
      </div>

      <div className="panel--pad detail">
        <div className="detail__score">
          <b style={{ color }}>{risk.score}</b>
          <span className="muted">/ 100 risk score</span>
        </div>
        <div className="row" style={{ gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ minWidth: 150 }}>
            <div className="eyebrow-sm">Confidence</div>
            <ConfidenceMeter value={risk.confidence} />
          </div>
          <div>
            <div className="eyebrow-sm">Customers served</div>
            <b>{formatInt(asset.customersServed)}</b>
          </div>
          <div>
            <div className="eyebrow-sm">Condition</div>
            <b style={{ textTransform: 'capitalize' }}>
              {asset.condition}{asset.condition === 'unknown' && ' ⚠'}
            </b>
          </div>
        </div>

        {asset.condition === 'unknown' && (
          <div className="banner banner--warn" style={{ margin: 0 }}>
            Maintenance condition unavailable — confidence reduced and flagged, not imputed.
          </div>
        )}

        {/* explainability: contributing factors */}
        <div>
          <div className="eyebrow-sm" style={{ marginBottom: '.5rem' }}>Contributing factors</div>
          {risk.factors.map((f) => (
            <div className="factor" key={f.label}>
              <div className="factor__top">
                <span>{f.label}</span>
                <b>+{f.weight}</b>
              </div>
              <div className="factor__bar">
                <div className="factor__fill" style={{ width: `${Math.min(100, f.weight * 2)}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* cross-domain dependency cascade */}
        <div>
          <div className="eyebrow-sm" style={{ marginBottom: '.5rem' }}>Cross-domain dependency cascade</div>
          {upstream.length > 0 && (
            <div className="muted" style={{ fontSize: '.78rem', marginBottom: '.4rem' }}>
              Powered by: {upstream.map((u) => u.name).join(', ')}
            </div>
          )}
          {dependents.length === 0 ? (
            <div className="muted" style={{ fontSize: '.82rem' }}>No downstream dependents recorded.</div>
          ) : (
            <div className="cascade">
              <div className="cascade__node" style={{ borderLeftColor: color }}>
                <b>{asset.name}</b> fails →
              </div>
              {dependents.slice(0, 4).map((d) => (
                <div key={d.id} className="cascade__node">
                  <span className={`risk-dot ${computeRisk(d, clock).band}`} />
                  {d.name} <span className="muted">· {formatInt(d.customersServed)} customers</span>
                </div>
              ))}
              {waterDependents.length > 0 && asset.domain === 'grid' && (
                <div style={{ fontSize: '.8rem', color: '#6b5200' }}>
                  Grid failure propagates to <b>{waterDependents.length}</b> water asset(s) —
                  ~{formatInt(affectedDownstream * 0.4)} additional customers exposed.
                </div>
              )}
            </div>
          )}
        </div>

        {/* recommended action (advisory) */}
        <div className="banner banner--hitl" style={{ margin: 0 }}>
          <div>
            <b>Recommended:</b> {risk.band === 'critical' || risk.band === 'high'
              ? 'Pre-stage a crew within the lead-time window.'
              : 'Monitor — re-evaluate as the forecast updates.'}
          </div>
        </div>
        {inPlan ? (
          <div className="row" style={{ gap: '.6rem', flexWrap: 'wrap' }}>
            <span className="tag tag--approved" style={{ fontSize: '.78rem', padding: '.35rem .7rem' }}>
              ✓ In deployment plan
            </span>
            <button className="btn-sm btn-reject" onClick={() => removeFromPlan(asset.id)}>Remove</button>
            <Link className="btn-sm btn-edit" to="/deployment" style={{ textDecoration: 'none' }}>View plan →</Link>
          </div>
        ) : (
          <button className="aecom-btn aecom-btn--primary" style={{ alignSelf: 'flex-start' }} onClick={() => addToPlan(asset)}>
            <IconTruck width={16} height={16} /> Add to deployment plan
          </button>
        )}
      </div>
    </div>
  )
}
