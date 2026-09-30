import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { getPageTitle, usePageTitle, DEFAULT_TITLE } from './usePageTitle'

function TitleProbe({ title }) {
    usePageTitle(title)
    return null
}

describe('getPageTitle', () => {
    it('names each section of the app', () => {
        expect(getPageTitle('/search')).toBe('Buscar alimento')
        expect(getPageTitle('/admin')).toBe('Administración')
    })

    it('matches nested paths of a section', () => {
        expect(getPageTitle('/emergency/TOXIC')).toBe('Emergencias')
    })

    it('does not confuse sections that share a prefix', () => {
        expect(getPageTitle('/searching')).toBeNull()
    })
})

describe('usePageTitle', () => {
    it('puts the page name before the app name', () => {
        render(<TitleProbe title="Historial" />)
        expect(document.title).toBe('Historial · CanMyPet?')
    })

    it('falls back to the default title', () => {
        render(<TitleProbe title={null} />)
        expect(document.title).toBe(DEFAULT_TITLE)
    })
})