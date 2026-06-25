import { useState } from 'react'
import { RiskBadge } from './RiskBadge.jsx'
import { formatInt } from '../lib/util.js'
import { IconTruck, IconShield } from './icons.jsx'

// "Action required" panel: surfaces the critical/high assets an operator must act
// on now, with one-tap actions that log to the audit trail (PRD O2 + F8).
export function CriticalPriorities({ items, selectedId, onSelect, logAction }) {
  const [actions, setActions] = useState({}) // assetId -> 'staged' | 'ack'

  const criticalCount = items.filter((i) => i.risk.band === 'critical').length

  const act = (asset, risk, kind) => {
    setActions((a) => ({ ...a, [asset.id]: kind }))
    if (kind === 'staged') {
      logAction('Crew staging requested', `${asset.name} — risk ${risk.score} (${risk.band}), added to deployment plan`)
    } else {
      logAction('Acknowledged critical asset', `${asset.name} — risk ${risk.score} (${risk.band})`)
    }
  }

  return (
    <div className="panel crit-panel" style={{ marginBottom: '1.25rem' }}>
      <div className="panel__head crit-head">
        <h3>
          <span className="crit-dot" /> Priority actions — action required
          <span className="count-badge">{criticalCount} critical</span>
        </h3>
        <span className="eyebrow-sm">Tap to act · logged to audit</span>
      </div>

      {items.length === 0 ? (
        <div className="panel--pad muted">
          No high-priority assets at the current forecast hour. Advance the scenario clock to see
          risk escalate as the storm nears landfall.
        </div>
      ) : (
        <div className="crit-list">
          {items.slice(0, 6).map(({ asset, risk }) => {
            const done = actions[asset.id]
            const action =
              risk.band === 'critical'
                ? 'Pre-stage a crew immediately — within the lead-time window.'
                : 'Stage or hold — re-evaluate as the forecast sharpens.'
            return (
              <div
                key={asset.id}
                className={`crit-row ${risk.band} ${asset.id === selectedId ? 'is-selected' : ''}`}
                onClick={() => onSelect(asset.id)}
              >
                <div className="crit-row__score" style={{ color: `var(--risk-${risk.band})` }}>
                  {risk.score}
                </div>
                <div className="crit-row__body">
                  <div className="crit-row__name">
                    {asset.name} <RiskBadge band={risk.band} />
                  </div>
                  <div className="crit-row__meta">
                    {asset.region} · {formatInt(asset.customersServed)} customers · {risk.confidence}% conf.
                  </div>
                  <div className="crit-row__rec">{action}</div>
                </div>
                <div className="crit-row__actions" onClick={(e) => e.stopPropagation()}>
                  {done ? (
                    <span className={`tag ${done === 'staged' ? 'tag--approved' : ''}`}>
                      {done === 'staged' ? '✓ Staging requested' : '✓ Acknowledged'}
                    </span>
                  ) : (
                    <>
                      <button className="btn-sm btn-approve" onClick={() => act(asset, risk, 'staged')}>
                        <IconTruck width={14} height={14} /> Stage crew
                      </button>
                      <button className="btn-sm btn-edit" onClick={() => act(asset, risk, 'ack')}>
                        <IconShield width={14} height={14} /> Acknowledge
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
