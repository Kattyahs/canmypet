import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import HomeRedirect from './HomeRedirect'
import { getHomePath } from './homePath'
import { useAuth } from '../context/AuthContext'

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }))

function renderAt(path) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route path="/" element={<HomeRedirect />} />
                <Route path="/dashboard" element={<HomeRedirect />} />
                <Route path="/search" element={<p>Buscar alimento</p>} />
                <Route path="/vet" element={<p>Panel veterinario</p>} />
                <Route path="/admin" element={<p>Administración</p>} />
            </Routes>
        </MemoryRouter>
    )
}

describe('home by role', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it.each([
        ['OWNER', 'Buscar alimento'],
        ['VETERINARIAN', 'Panel veterinario'],
        ['ADMIN', 'Administración'],
    ])('sends a %s to their own landing page', (role, landing) => {
        useAuth.mockReturnValue({ user: { role } })
        renderAt('/')
        expect(screen.getByText(landing)).toBeInTheDocument()
    })

    it('redirects the old dashboard address too', () => {
        useAuth.mockReturnValue({ user: { role: 'VETERINARIAN' } })
        renderAt('/dashboard')
        expect(screen.getByText('Panel veterinario')).toBeInTheDocument()
    })

    it('falls back to the food search for an unknown role', () => {
        expect(getHomePath(undefined)).toBe('/search')
    })
})