// GenAI EOC Copilot (mock, read-only RAG). Natural-language queries answered over
// the live risk / forecast / deployment state, with answers that CITE the specific
// assets and scores behind them (PRD F7 / §5.6). Read-only: takes no actions.

import { ASSETS } from './assets.js'
import { rankByRisk, computeRisk } from '../lib/risk.js'
import { impactSnapshot } from '../lib/forecast.js'
import { optimiseDeployment } from '../lib/optimise.js'
import { formatInt } from '../lib/util.js'

// Suggested prompts shown as chips — keep the demo reliable.
export const SUGGESTED = [
  'Which substations are highest risk in the next 24h?',
  'How many customers could lose service?',
  'Where should I stage crews first?',
  'What is driving the risk at Battery Point?',
  'Show flood-risk water assets',
]

// Each intent: a matcher + an answer builder that reads the current clock state.
const INTENTS = [
  {
    test: (q) => /substation|highest risk|top risk|most at risk/.test(q),
    answer: (clock) => {
      const top = rankByRisk(ASSETS.filter((a) => a.domain === 'grid'), clock).slice(0, 3)
      return {
        text: `Top grid assets by risk right now:`,
        cites: top.map(({ asset, risk }) => ({
          id: asset.id,
          name: asset.name,
          score: risk.score,
          band: risk.band,
          detail: `${risk.confidence}% confidence · ${formatInt(asset.customersServed)} customers`,
        })),
      }
    },
  },
  {
    test: (q) => /customer|lose service|impact|affected|outage/.test(q),
    answer: (clock) => {
      const s = impactSnapshot(clock)
      return {
        text: `Projected impact: ~${formatInt(s.affectedNow)} customers affected now, peaking near ~${formatInt(s.peakAffected)} around landfall. Estimated restoration window ~${s.restorationHrs}h. This includes water customers cut off by upstream grid failures.`,
        cites: [],
      }
    },
  },
  {
    test: (q) => /stage|crew|deploy|where.*first|prioriti/.test(q),
    answer: (clock) => {
      const recs = optimiseDeployment(clock).slice(0, 3)
      return {
        text: `Recommended first crew staging (advisory — requires your approval):`,
        cites: recs.map((r) => ({
          id: r.asset.id,
          name: `${r.crew.name} → ${r.asset.name}`,
          score: r.risk.score,
          band: r.risk.band,
          detail: `ETA ${r.etaMin}m · ~${r.benefitHrs}h restoration benefit`,
        })),
      }
    },
  },
  {
    test: (q) => /driving|why|factor|explain|battery point/.test(q),
    answer: (clock) => {
      const asset =
        ASSETS.find((a) => /battery/i.test(a.name)) ||
        rankByRisk(ASSETS, clock)[0].asset
      const risk = computeRisk(asset, clock)
      return {
        text: `${asset.name} is scored ${risk.score}/100 (${risk.band}) at ${risk.confidence}% confidence. The main contributing factors:`,
        cites: risk.factors.map((f) => ({
          id: asset.id,
          name: f.label,
          score: f.weight,
          band: risk.band,
          detail: `contribution`,
        })),
      }
    },
  },
  {
    test: (q) => /flood|water|surge|treatment|pump/.test(q),
    answer: (clock) => {
      const top = rankByRisk(ASSETS.filter((a) => a.domain === 'water'), clock).slice(0, 3)
      return {
        text: `Highest flood/surge-exposed water assets:`,
        cites: top.map(({ asset, risk }) => ({
          id: asset.id,
          name: asset.name,
          score: risk.score,
          band: risk.band,
          detail: `${asset.region} · ${formatInt(asset.customersServed)} customers`,
        })),
      }
    },
  },
]

export function askCopilot(query, clock) {
  const q = query.toLowerCase()
  const intent = INTENTS.find((i) => i.test(q))
  if (intent) return intent.answer(clock)
  // graceful default
  const top = rankByRisk(ASSETS, clock).slice(0, 3)
  return {
    text: `I can answer over the live risk, forecast and deployment state. For example, the current highest-risk assets are:`,
    cites: top.map(({ asset, risk }) => ({
      id: asset.id,
      name: asset.name,
      score: risk.score,
      band: risk.band,
      detail: `${asset.region}`,
    })),
  }
}
