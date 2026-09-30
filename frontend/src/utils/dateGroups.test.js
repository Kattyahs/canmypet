import { describe, it, expect } from 'vitest'
import { dayLabel, groupByDay } from './dateGroups'

const NOW = new Date(2026, 8, 30, 15, 0)

describe('dateGroups', () => {
    it('names today and yesterday, and dates the rest', () => {
        expect(dayLabel(new Date(2026, 8, 30, 8, 0), NOW)).toBe('Hoy')
        expect(dayLabel(new Date(2026, 8, 29, 23, 0), NOW)).toBe('Ayer')
        expect(dayLabel(new Date(2026, 8, 28, 10, 0), NOW)).toBe('28 de septiembre')
        expect(dayLabel(new Date(2025, 11, 31, 10, 0), NOW)).toBe('31 de diciembre de 2025')
    })

    it('groups consecutive items of the same day, keeping their order', () => {
        const items = [
            { id: 1, at: '2026-09-30T10:00:00' },
            { id: 2, at: '2026-09-30T09:00:00' },
            { id: 3, at: '2026-09-29T20:00:00' },
        ]
        const groups = groupByDay(items, (item) => item.at, NOW)
        expect(groups.map((g) => g.label)).toEqual(['Hoy', 'Ayer'])
        expect(groups[0].items.map((i) => i.id)).toEqual([1, 2])
    })
})