import { describe, it, expect } from 'vitest'
import { riskBand, computeRisk, rankByRisk } from './risk.js'
import { ASSETS, ASSET_BY_ID } from '../data/assets.js'

describe('riskBand thresholds', () => {
  it('maps scores onto the four bands at the documented cutoffs', () => {
    expect(riskBand(80)).toBe('critical') // >= 75
    expect(riskBand(75)).toBe('critical')
    expect(riskBand(60)).toBe('high') // >= 55
    expect(riskBand(40)).toBe('elevated') // >= 30
    expect(riskBand(10)).toBe('low')
  })
})

describe('computeRisk', () => {
  const asset = ASSET_BY_ID['SS-Battery']

  it('produces a bounded, explainable score', () => {
    const risk = computeRisk(asset, 24)
    expect(risk.score).toBeGreaterThanOrEqual(0)
    expect(risk.score).toBeLessThanOrEqual(100)
    expect(risk.band).toBe(riskBand(risk.score))
    // the contributing factors should add up to the headline score
    const sum = risk.factors.reduce((t, f) => t + f.weight, 0)
    expect(sum).toBeCloseTo(risk.score, 0)
  })

  it('lowers confidence for assets in unknown condition', () => {
    const known = computeRisk({ ...asset, condition: 'good' }, 24)
    const unknown = computeRisk({ ...asset, condition: 'unknown' }, 24)
    expect(unknown.confidence).toBeLessThan(known.confidence)
  })

  it('raises hazard exposure as the storm nears landfall', () => {
    const early = computeRisk(asset, 6)
    const late = computeRisk(asset, 46)
    expect(late.hazard).toBeGreaterThan(early.hazard)
  })
})

describe('rankByRisk (drives the asset overlay)', () => {
  it('scores every asset and sorts highest-risk first', () => {
    const ranked = rankByRisk(ASSETS, 36)
    // the aerial overlay relies on getting the full asset set back
    expect(ranked).toHaveLength(ASSETS.length)
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1].risk.score).toBeGreaterThanOrEqual(ranked[i].risk.score)
    }
    // each entry carries both the asset and its computed risk record
    expect(ranked[0]).toHaveProperty('asset.id')
    expect(ranked[0]).toHaveProperty('risk.band')
  })
})
