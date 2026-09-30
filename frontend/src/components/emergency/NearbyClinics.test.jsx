import { describe, it, expect, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NearbyClinics from './NearbyClinics'

const mapSrc = () => new URL(screen.getByTitle('Mapa de veterinarias de urgencia cercanas').getAttribute('src'))

describe('NearbyClinics', () => {
    const originalGeolocation = navigator.geolocation

    afterEach(() => {
        Object.defineProperty(navigator, 'geolocation', { value: originalGeolocation, configurable: true })
    })

    it('shows emergency vets around Santiago without asking for the location', () => {
        let asked = false
        Object.defineProperty(navigator, 'geolocation', { value: { getCurrentPosition: () => (asked = true) }, configurable: true })
        render(<NearbyClinics apiKey="" />)

        expect(screen.getByText('Cerca del centro de Santiago.')).toBeInTheDocument()
        expect(mapSrc().searchParams.get('q')).toBe('veterinaria de urgencia 24 horas, Santiago, Chile')
        expect(asked).toBe(false)
    })

    it('moves the map to the device after the user shares the location', async () => {
        Object.defineProperty(navigator, 'geolocation', {
            value: { getCurrentPosition: (ok) => ok({ coords: { latitude: -36.82, longitude: -73.05 } }) },
            configurable: true,
        })
        const user = userEvent.setup()
        render(<NearbyClinics apiKey="" />)

        await user.click(screen.getByRole('button', { name: 'Usar mi ubicación' }))

        expect(screen.getByText('Cerca de tu ubicación.')).toBeInTheDocument()
        expect(mapSrc().searchParams.get('ll')).toBe('-36.82,-73.05')
        expect(screen.getByRole('link', { name: /abrir en google maps/i })).toHaveAttribute(
            'href',
            'https://www.google.com/maps/search/veterinaria+de+urgencia+24+horas/@-36.82,-73.05,14z'
        )
    })

    it('lets the user pick a city when the location is denied', async () => {
        Object.defineProperty(navigator, 'geolocation', {
            value: { getCurrentPosition: (ok, fail) => fail({ code: 1 }) },
            configurable: true,
        })
        const user = userEvent.setup()
        render(<NearbyClinics apiKey="" />)

        await user.click(screen.getByRole('button', { name: 'Usar mi ubicación' }))
        expect(screen.getByRole('alert')).toHaveTextContent('No diste permiso para usar tu ubicación')

        await user.selectOptions(screen.getByLabelText('Ciudad'), 'concepcion')
        expect(mapSrc().searchParams.get('q')).toBe('veterinaria de urgencia 24 horas, Concepción, Chile')
    })

    it('uses the official embed when a key is configured', () => {
        render(<NearbyClinics apiKey="test-key" />)
        expect(mapSrc().pathname).toBe('/maps/embed/v1/search')
    })
})