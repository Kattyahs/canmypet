import { describe, it, expect } from 'vitest'
import { buildEmbedUrl, buildOpenUrl } from './googleMaps'

const SANTIAGO = { lat: -33.4378, lng: -70.6505, cityName: 'Santiago' }
const DEVICE = { lat: -36.826789, lng: -73.049812, cityName: null }

describe('googleMaps', () => {
    it('uses the official Embed API when there is a key', () => {
        const url = new URL(buildEmbedUrl(SANTIAGO, 'test-key'))
        expect(url.origin + url.pathname).toBe('https://www.google.com/maps/embed/v1/search')
        expect(url.searchParams.get('key')).toBe('test-key')
        expect(url.searchParams.get('q')).toBe('veterinaria de urgencia, Santiago, Chile')
        expect(url.searchParams.get('center')).toBe('-33.438,-70.65')
    })

    it('falls back to the keyless embed when there is no key', () => {
        const url = new URL(buildEmbedUrl(DEVICE))
        expect(url.origin + url.pathname).toBe('https://maps.google.com/maps')
        expect(url.searchParams.get('output')).toBe('embed')
        expect(url.searchParams.get('q')).toBe('veterinaria de urgencia')
        expect(url.searchParams.get('ll')).toBe('-36.827,-73.05')
        expect(url.searchParams.has('key')).toBe(false)
    })

    it('opens the same search in Google Maps, centred on the place', () => {
        expect(buildOpenUrl(DEVICE)).toBe('https://www.google.com/maps/search/veterinaria+de+urgencia/@-36.827,-73.05,14z')
    })
})