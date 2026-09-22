import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import RoleRoute from './RoleRoute'
import { useAuth } from '../context/AuthContext'

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }))

function renderAt(path) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route path="/login" element={<p>Login page</p>} />
                <Route element={<RoleRoute allowedRoles={['VETERINARIAN']} />}>
                    <Route path="/vet" element={<p>Vet panel</p>} />
                </Route>
            </Routes>
        </MemoryRouter>
    )
}

describe('RoleRoute', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it('renders the child route when the user has an allowed role', () => {
        useAuth.mockReturnValue({ user: { role: 'VETERINARIAN' }, loading: false })
        renderAt('/vet')
        expect(screen.getByText('Vet panel')).toBeInTheDocument()
    })

    it('shows the forbidden page to a role that is not allowed', () => {
        useAuth.mockReturnValue({ user: { role: 'OWNER' }, loading: false })
        renderAt('/vet')
        expect(screen.getByRole('heading', { name: /no tienes acceso/i })).toBeInTheDocument()
        expect(screen.queryByText('Vet panel')).not.toBeInTheDocument()
    })

    it('redirects to login when there is no session', () => {
        useAuth.mockReturnValue({ user: null, loading: false })
        renderAt('/vet')
        expect(screen.getByText('Login page')).toBeInTheDocument()
    })

    it('renders nothing while the session is loading', () => {
        useAuth.mockReturnValue({ user: null, loading: true })
        const { container } = renderAt('/vet')
        expect(container).toBeEmptyDOMElement()
    })
})