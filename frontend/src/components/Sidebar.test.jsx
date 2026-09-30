import { describe, it, expect } from 'vitest'
import { getNavItems } from './Sidebar'

const paths = (items) => items.map((item) => item.to)

describe('getNavItems', () => {
    it('hides the veterinarian panel from owners', () => {
        expect(paths(getNavItems('OWNER').visibleItems)).not.toContain('/vet')
    })

    it('starts the navigation with the food search and has no home page', () => {
        const { visibleItems } = getNavItems('OWNER')
        expect(paths(visibleItems)[0]).toBe('/search')
        expect(paths(visibleItems)).not.toContain('/dashboard')
    })

    it('fits every owner item in the mobile bar, emergencies included', () => {
        expect(paths(getNavItems('OWNER').mobileTabs)).toEqual([
            '/search',
            '/pets',
            '/history',
            '/faq',
            '/emergency',
        ])
    })

    it('keeps emergencies in the mobile bar for veterinarians and admins', () => {
        expect(paths(getNavItems('VETERINARIAN').mobileTabs)).toContain('/emergency')
        expect(paths(getNavItems('ADMIN').mobileTabs)).toContain('/emergency')
    })

    it('shows the panel to veterinarians, including on mobile', () => {
        const { visibleItems, mobileTabs } = getNavItems('VETERINARIAN')
        expect(paths(visibleItems)).toContain('/vet')
        expect(paths(mobileTabs)).toContain('/vet')
        expect(mobileTabs).toHaveLength(5)
    })

    it('hides the admin panel from owners and veterinarians', () => {
        expect(paths(getNavItems('OWNER').visibleItems)).not.toContain('/admin')
        expect(paths(getNavItems('VETERINARIAN').visibleItems)).not.toContain('/admin')
    })

    it('gives admins every owner item plus the admin panel, including on mobile', () => {
        const { visibleItems, mobileTabs } = getNavItems('ADMIN')
        const ownerPaths = paths(getNavItems('OWNER').visibleItems)
        expect(paths(visibleItems)).toEqual(expect.arrayContaining([...ownerPaths, '/admin']))
        expect(paths(visibleItems)).not.toContain('/vet')
        expect(paths(mobileTabs)).toContain('/admin')
        expect(mobileTabs).toHaveLength(5)
    })

    it('treats a missing role as having no role-restricted items', () => {
        expect(paths(getNavItems(undefined).visibleItems)).not.toContain('/vet')
    })

    it('keeps nothing out of reach on mobile: what does not fit goes to the account menu', () => {
        expect(getNavItems('OWNER').overflowItems).toEqual([])
        expect(paths(getNavItems('VETERINARIAN').overflowItems)).toEqual(['/history'])
        expect(paths(getNavItems('ADMIN').overflowItems)).toEqual(['/history'])
    })

    it('ends the mobile bar with emergencies for every role', () => {
        for (const role of ['OWNER', 'VETERINARIAN', 'ADMIN']) {
            expect(paths(getNavItems(role).mobileTabs).at(-1)).toBe('/emergency')
        }
    })
})