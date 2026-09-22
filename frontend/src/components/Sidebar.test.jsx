import { describe, it, expect } from 'vitest'
import { getNavItems } from './Sidebar'

const paths = (items) => items.map((item) => item.to)

describe('getNavItems', () => {
    it('hides the veterinarian panel from owners', () => {
        expect(paths(getNavItems('OWNER').visibleItems)).not.toContain('/vet')
    })

    it('keeps the owner mobile bar as it was before role-based navigation', () => {
        expect(paths(getNavItems('OWNER').mobileTabs)).toEqual([
            '/dashboard',
            '/pets',
            '/search',
            '/history',
            '/faq',
        ])
    })

    it('shows the panel to veterinarians, including on mobile', () => {
        const { visibleItems, mobileTabs } = getNavItems('VETERINARIAN')
        expect(paths(visibleItems)).toContain('/vet')
        expect(paths(mobileTabs)).toContain('/vet')
        expect(mobileTabs).toHaveLength(5)
    })

    it('treats a missing role as having no role-restricted items', () => {
        expect(paths(getNavItems(undefined).visibleItems)).not.toContain('/vet')
    })
})