import { describe, it, expect } from 'vitest'
import { resolveEntry, sortBySeverity, isSafeUrl } from './foodSafety'

const DOG_GENERAL = { id: 1, species: 'DOG', lifeStage: null, riskLevel: 'TOXIC' }
const DOG_PUPPY = { id: 2, species: 'DOG', lifeStage: 'PUPPY', riskLevel: 'LETHAL' }
const CAT_GENERAL = { id: 3, species: 'CAT', lifeStage: null, riskLevel: 'MODERATE' }
const ENTRIES = [CAT_GENERAL, DOG_GENERAL, DOG_PUPPY]

describe('resolveEntry', () => {
    it('prefers the entry for the exact life stage', () => {
        expect(resolveEntry(ENTRIES, 'DOG', 'PUPPY').entry).toBe(DOG_PUPPY)
    })

    it('falls back to the general entry and says so', () => {
        const result = resolveEntry(ENTRIES, 'DOG', 'SENIOR')
        expect(result.entry).toBe(DOG_GENERAL)
        expect(result.usedGeneralForStage).toBe(true)
    })

    it('uses the general entry when no stage is given', () => {
        const result = resolveEntry(ENTRIES, 'DOG', null)
        expect(result.entry).toBe(DOG_GENERAL)
        expect(result.usedGeneralForStage).toBe(false)
    })

    it('returns no entry but keeps the stage-specific ones when there is no general entry', () => {
        const result = resolveEntry([DOG_PUPPY], 'DOG', 'ADULT')
        expect(result.entry).toBeNull()
        expect(result.speciesEntries).toEqual([DOG_PUPPY])
    })
})

describe('sortBySeverity', () => {
    it('orders from the most to the least dangerous', () => {
        expect(sortBySeverity(ENTRIES).map((e) => e.id)).toEqual([2, 1, 3])
    })
})

describe('isSafeUrl', () => {
    it('only accepts http and https links', () => {
        expect(isSafeUrl('https://www.aspca.org')).toBe(true)
        expect(isSafeUrl('javascript:alert(1)')).toBe(false)
        expect(isSafeUrl(null)).toBe(false)
    })
})