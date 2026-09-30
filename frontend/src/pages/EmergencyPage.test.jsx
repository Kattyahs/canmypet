import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import EmergencyPage from './EmergencyPage'
import { getEmergencyGuide } from '../api/emergency'
vi.mock('../components/emergency/NearbyClinics', () => ({ default: () => <section aria-label="Veterinarias cercanas" /> }))
vi.mock('../api/emergency', () => ({ getEmergencyGuide: vi.fn() }))

function renderAt(path) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route path="/emergency/:riskLevel?" element={<EmergencyPage />} />
            </Routes>
        </MemoryRouter>
    )
}

describe('EmergencyPage', () => {
    beforeEach(() => vi.resetAllMocks())

    it('shows the guide for the level in the URL', async () => {
        getEmergencyGuide.mockResolvedValue({
            data: { riskLevel: 'LETHAL', steps: 'Ve a urgencias', emergencyContactsInfo: null },
        })
        renderAt('/emergency/LETHAL')

        expect(await screen.findByText('Ve a urgencias')).toBeInTheDocument()
        expect(getEmergencyGuide).toHaveBeenCalledWith('LETHAL')
        expect(screen.getByRole('button', { name: /letal/i })).toHaveAttribute('aria-pressed', 'true')
    })

    it('explains that a level has no guide yet', async () => {
        getEmergencyGuide.mockRejectedValue({ isAxiosError: true, response: { status: 404 } })
        renderAt('/emergency/MODERATE')
        expect(await screen.findByText('Todavía no hay una guía para este nivel')).toBeInTheDocument()
    })

    it('shows an error with retry when the guide cannot be loaded', async () => {
        getEmergencyGuide.mockRejectedValue({ isAxiosError: true, response: { status: 500 } })
        renderAt('/emergency/TOXIC')
        expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar la guía de emergencia.')
        expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
    })
})