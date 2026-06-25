import { describe, it, expect } from 'vitest'
import { ASSETS, ASSET_BY_ID, downstreamDependents } from './assets.js'

describe('cross-domain dependency cascade', () => {
  it('propagates a grid failure into water-domain impact', () => {
    // Battery Point Substation feeds the Harborview lift → Ashley River WTP chain.
    const dependents = downstreamDependents('SS-Battery')
    const ids = dependents.map((d) => d.id)
    expect(ids).toContain('PS-Harborview')
    expect(ids).toContain('WT-Ashley')
    // the headline differentiator: a grid fault reaches the water domain
    expect(dependents.some((d) => d.domain === 'water')).toBe(true)
  })

  it('terminates (no infinite loop) and only returns real assets', () => {
    const dependents = downstreamDependents('TX-Coastal')
    expect(dependents.length).toBeGreaterThan(0)
    dependents.forEach((d) => expect(ASSET_BY_ID[d.id]).toBeDefined())
    // no asset should appear twice
    const ids = dependents.map((d) => d.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every dependsOn edge points at an asset that exists', () => {
    for (const a of ASSETS) {
      for (const depId of a.dependsOn) {
        expect(ASSET_BY_ID[depId], `${a.id} depends on missing ${depId}`).toBeDefined()
      }
    }
  })
})
