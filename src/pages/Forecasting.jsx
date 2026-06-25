import { useMemo, useState } from 'react'
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine, BarChart, Bar, Cell,
} from 'recharts'
import { useScenario } from '../lib/ScenarioContext.jsx'
import { buildForecast, impactSnapshot } from '../lib/forecast.js'
import { ASSETS, REGIONS } from '../data/assets.js'
import { rankByRisk, BAND_META } from '../lib/risk.js'
import { formatInt } from '../lib/util.js'
import { PageHead } from '../components/AppShell.jsx'

const TEAL = '#044955'
const GREEN = '#00A651'
const ORANGE = '#E8662A'

export function Forecasting() {
  const { clock } = useScenario()
  const [region, setRegion] = useState('all')

  const data = useMemo(() => buildForecast(clock, region), [clock, region])
  const snapshot = useMemo(() => impactSnapshot(clock, region), [clock, region])
  const nowHour = Math.round(clock)

  // region breakdown at current clock
  const regionBreakdown = useMemo(
    () =>
      REGIONS.map((r) => {
        const peak = impactSnapshot(clock, r).peakAffected
        return { region: r, peak }
      }).sort((a, b) => b.peak - a.peak),
    [clock]
  )

  // top contributors to projected impact
  const contributors = useMemo(
    () => rankByRisk(ASSETS, clock).slice(0, 6).map(({ asset, risk }) => ({
      name: asset.name.replace(/ (Substation|Transmission Node|Water Treatment|Pump Station|Lift Station|Treatment Plant)/, ''),
      customers: Math.round(asset.customersServed * risk.pFail),
      band: risk.band,
    })),
    [clock]
  )

  return (
    <>
      <PageHead title="Impact &amp; Outage Forecast">
        Time-series projection of customers affected and restoration effort across the 48-hour
        window. The marker tracks the live scenario clock; curves update as risk evolves.
      </PageHead>

      <div className="kpi-strip">
        <div className="kpi">
          <div className="kpi__label">Affected now</div>
          <div className="kpi__num is-risk">{formatInt(snapshot.affectedNow)}</div>
          <div className="kpi__sub">customers</div>
        </div>
        <div className="kpi">
          <div className="kpi__label">Projected peak</div>
          <div className="kpi__num">{formatInt(snapshot.peakAffected)}</div>
          <div className="kpi__sub">near landfall</div>
        </div>
        <div className="kpi">
          <div className="kpi__label">Restoration estimate</div>
          <div className="kpi__num">{snapshot.restorationHrs}h</div>
          <div className="kpi__sub">at projected peak</div>
        </div>
        <div className="kpi">
          <div className="kpi__label">Pre-event window</div>
          <div className="kpi__num">{Math.max(0, 42 - nowHour)}h</div>
          <div className="kpi__sub">until staging closes (T-6h)</div>
        </div>
      </div>

      <div className="filter-bar panel" style={{ marginBottom: '1.25rem' }}>
        <div className="filter-field">
          <label>Region</label>
          <select value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="all">All regions</option>
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="muted" style={{ fontSize: '.8rem', alignSelf: 'center' }}>
          Shaded band = forecast confidence interval (±16%). Vertical marker = now.
        </div>
      </div>

      <div className="panel panel--pad" style={{ marginBottom: '1.25rem' }}>
        <div className="row row--between" style={{ marginBottom: '.5rem' }}>
          <h3 style={{ margin: 0 }}>Customers affected over time</h3>
          <span className="eyebrow-sm">{region === 'all' ? 'All regions' : region}</span>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="band" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={ORANGE} stopOpacity={0.18} />
                <stop offset="100%" stopColor={ORANGE} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={5} />
            <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => formatInt(v)} labelFormatter={(l) => `Hour ${l}`} />
            <Area type="monotone" dataKey="high" stroke="none" fill="url(#band)" />
            <Area type="monotone" dataKey="low" stroke="none" fill="#fff" />
            <Area type="monotone" dataKey="affected" stroke={ORANGE} strokeWidth={2.5} fill="none" />
            <ReferenceLine x={data[nowHour]?.label} stroke={GREEN} strokeWidth={2} label={{ value: 'NOW', fill: GREEN, fontSize: 11, position: 'top' }} />
            <ReferenceLine x="Landfall" stroke={TEAL} strokeDasharray="4 4" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid-2">
        <div className="panel panel--pad">
          <h3 style={{ marginTop: 0 }}>Estimated restoration effort</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={7} />
              <YAxis tick={{ fontSize: 11 }} unit="h" />
              <Tooltip formatter={(v) => `${v} h`} />
              <Line type="monotone" dataKey="restorationHrs" stroke={TEAL} strokeWidth={2.5} dot={false} />
              <ReferenceLine x={data[nowHour]?.label} stroke={GREEN} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="panel panel--pad">
          <h3 style={{ marginTop: 0 }}>Peak impact by region</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={regionBreakdown} layout="vertical" margin={{ top: 8, right: 24, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" horizontal={false} />
              <XAxis type="number" tickFormatter={(v) => `${Math.round(v / 1000)}k`} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="region" tick={{ fontSize: 12 }} width={70} />
              <Tooltip formatter={(v) => formatInt(v)} />
              <Bar dataKey="peak" radius={[0, 4, 4, 0]} fill={TEAL} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel panel--pad" style={{ marginTop: '1.25rem' }}>
        <h3 style={{ marginTop: 0 }}>Top contributors to projected impact</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={contributors} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-12} textAnchor="end" height={60} />
            <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => formatInt(v)} />
            <Bar dataKey="customers" radius={[4, 4, 0, 0]}>
              {contributors.map((c, i) => (
                <Cell key={i} fill={BAND_META[c.band].color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  )
}
