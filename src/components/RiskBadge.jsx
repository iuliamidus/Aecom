import { BAND_META } from '../lib/risk.js'

export function RiskBadge({ band, children }) {
  return <span className={`risk-badge ${band}`}>{children || BAND_META[band].label}</span>
}

export function RiskDot({ band }) {
  return <span className={`risk-dot ${band}`} title={BAND_META[band].label} />
}

export function ConfidenceMeter({ value }) {
  return (
    <span className="conf" title="Model confidence">
      <span className="conf__bar">
        <span className="conf__fill" style={{ width: `${value}%` }} />
      </span>
      <span className="conf__val">{value}%</span>
    </span>
  )
}
