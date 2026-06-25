import { useMemo } from 'react'
import { ASSETS } from '../data/assets.js'
import { computeRisk, BAND_META } from '../lib/risk.js'

// Supply order, left → right: power originates at transmission, flows through
// substations into pumping stations and finally water-treatment plants. Drawing
// it this way makes the grid→water cascade legible at a glance (PRD F6).
const TIER = { transmission: 0, substation: 1, pumping: 2, water_treatment: 3 }
export const TIER_LABEL = ['Transmission', 'Substation', 'Pumping', 'Water treatment']

const NODE_W = 168
const NODE_H = 28
const V_GAP = 11
const COL_GAP = 92
const PAD_X = 20
const PAD_Y = 44

// Strip the type words so the node label fits; full name lives in the tooltip.
function shortName(name) {
  const s = name
    .replace(/ (Substation|Transmission Node|Water Treatment|Treatment Plant|Pump Station|Pumping Station|Lift Station)$/i, '')
    .trim()
  return s.length > 20 ? s.slice(0, 19) + '…' : s
}

export function CascadeGraph({ clock, selectedId, onSelect, cascadeIds }) {
  const { pos, edges, width, height } = useMemo(() => {
    const byTier = [[], [], [], []]
    ASSETS.forEach((a) => byTier[TIER[a.type]].push(a))
    byTier.forEach((col) =>
      col.sort((x, y) => x.region.localeCompare(y.region) || x.name.localeCompare(y.name))
    )
    const pos = {}
    let maxRows = 0
    byTier.forEach((col, t) => {
      maxRows = Math.max(maxRows, col.length)
      col.forEach((a, i) => {
        pos[a.id] = { x: PAD_X + t * (NODE_W + COL_GAP), y: PAD_Y + i * (NODE_H + V_GAP) }
      })
    })
    const edges = []
    ASSETS.forEach((a) =>
      a.dependsOn.forEach((depId) => {
        if (pos[depId] && pos[a.id]) edges.push({ from: depId, to: a.id })
      })
    )
    return {
      pos,
      edges,
      width: PAD_X * 2 + 4 * NODE_W + 3 * COL_GAP,
      height: PAD_Y + maxRows * (NODE_H + V_GAP),
    }
  }, [])

  const bands = useMemo(
    () => Object.fromEntries(ASSETS.map((a) => [a.id, computeRisk(a, clock).band])),
    [clock]
  )

  return (
    <div className="cg-scroll">
      <svg className="cg-svg" width={width} height={height}>
        {/* tier headers */}
        {TIER_LABEL.map((label, t) => (
          <text key={label} className="cg-tier" x={PAD_X + t * (NODE_W + COL_GAP)} y={24}>
            {label}
          </text>
        ))}

        {/* dependency edges */}
        {edges.map((e, i) => {
          const a = pos[e.from]
          const b = pos[e.to]
          const x1 = a.x + NODE_W
          const y1 = a.y + NODE_H / 2
          const x2 = b.x
          const y2 = b.y + NODE_H / 2
          const mx = (x1 + x2) / 2
          const active = cascadeIds.has(e.from) && cascadeIds.has(e.to)
          return (
            <path
              key={i}
              className={`cg-edge ${active ? 'is-active' : ''}`}
              d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`}
            />
          )
        })}

        {/* asset nodes */}
        {ASSETS.map((a) => {
          const p = pos[a.id]
          const band = bands[a.id]
          const color = BAND_META[band].color
          const inCascade = cascadeIds.has(a.id)
          const isSel = a.id === selectedId
          const dim = cascadeIds.size > 1 && !inCascade
          return (
            <g
              key={a.id}
              className={`cg-node ${dim ? 'is-dim' : ''} ${isSel ? 'is-selected' : ''}`}
              transform={`translate(${p.x},${p.y})`}
              onClick={() => onSelect(a.id)}
            >
              <rect width={NODE_W} height={NODE_H} rx={6} fill={color} className="cg-node__rect" />
              <text className="cg-node__label" x={9} y={NODE_H / 2 + 4}>
                {shortName(a.name)}
              </text>
              <title>
                {a.name} · {a.region}
                {'\n'}
                {band.toUpperCase()} risk · {a.customersServed.toLocaleString()} customers
              </title>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
