import { describe, it, expect } from 'vitest'
import { consultationKey, describeTarget, describeConsultation } from './searchHistory'

describe('consultationKey', () => {
    it('groups consultations for a pet by food and pet only', () => {
        expect(consultationKey({ foodId: 10, petId: 1, species: 'DOG', lifeStage: 'ADULT' })).toBe(
            consultationKey({ foodId: 10, petId: 1, species: 'DOG', lifeStage: 'SENIOR' })
        )
    })

    it('treats each species and stage of the general search as a different consultation', () => {
        const keys = new Set([
            consultationKey({ foodId: 10, petId: null, species: null, lifeStage: null }),
            consultationKey({ foodId: 10, petId: null, species: 'DOG', lifeStage: null }),
            consultationKey({ foodId: 10, petId: null, species: 'DOG', lifeStage: 'PUPPY' }),
            consultationKey({ foodId: 10, petId: null, species: 'CAT', lifeStage: null }),
        ])
        expect(keys.size).toBe(4)
    })

    it('never mixes a pet consultation with a general one', () => {
        expect(consultationKey({ foodId: 10, petId: 1 })).not.toBe(consultationKey({ foodId: 10, species: 'DOG' }))
    })
})

describe('describeTarget', () => {
    it('describes a consultation without species as every species', () => {
        expect(describeTarget({ species: null, lifeStage: null })).toBe('Todas las especies')
    })

    it('uses the Spanish labels for species and stage', () => {
        expect(describeTarget({ species: 'CAT', lifeStage: null })).toBe('Gato')
        expect(describeTarget({ species: 'DOG', lifeStage: 'PUPPY' })).toBe('Perro · Cachorro')
    })
})

describe('describeConsultation', () => {
    const POPI = { id: 1, name: 'Popi', species: 'DOG', lifeStage: 'ADULT' }

    it('names the pet and uses the species and stage saved with the consultation', () => {
        expect(describeConsultation({ petId: 1, species: 'DOG', lifeStage: 'PUPPY' }, POPI)).toBe('Popi · Perro · Cachorro')
    })

    it('falls back to the pet data for consultations saved without species', () => {
        expect(describeConsultation({ petId: 1, species: null, lifeStage: null }, POPI)).toBe('Popi · Perro · Adulto')
    })

    it('describes the target when there is no pet', () => {
        expect(describeConsultation({ petId: null, species: 'CAT', lifeStage: 'SENIOR' }, null)).toBe('Gato · Senior')
    })
})