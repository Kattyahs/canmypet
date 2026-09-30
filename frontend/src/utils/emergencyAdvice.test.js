import { describe, it, expect } from 'vitest'
import { getEmergencyAdvice, getElapsedLabel } from './emergencyAdvice'

describe('getEmergencyAdvice', () => {
    it('does not send the owner to a guide when the food is safe', () => {
        expect(getEmergencyAdvice('SAFE', 'UNDER_30_MIN')).toMatchObject({ tone: 'safe', guideLevel: null })
    })

    it('asks to call even when many hours have passed for toxic foods', () => {
        const advice = getEmergencyAdvice('TOXIC', 'OVER_6_H')
        expect(advice.title).toBe('Llama a tu veterinario ahora')
        expect(advice.message).toMatch(/síntomas tardíos/)
        expect(advice.guideLevel).toBe('TOXIC')
    })

    it('treats lethal foods as an emergency whatever the elapsed time', () => {
        expect(getEmergencyAdvice('LETHAL', 'UNKNOWN').title).toMatch(/urgencia/)
    })

    it('falls back to caution and the toxic guide when there is no evaluation', () => {
        expect(getEmergencyAdvice(null, 'UP_TO_2_H')).toMatchObject({ tone: 'unknown', guideLevel: 'TOXIC' })
    })

    it('describes the elapsed time in lower case for sentences', () => {
        expect(getElapsedLabel('UP_TO_6_H')).toBe('entre 2 y 6 horas')
    })
})