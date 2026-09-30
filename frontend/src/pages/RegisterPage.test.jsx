import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import RegisterPage from './RegisterPage'
import axiosClient from '../api/axiosClient'

vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ login: vi.fn() }) }))
vi.mock('../api/axiosClient', () => ({ default: { post: vi.fn() } }))

function renderPage() {
    render(
        <MemoryRouter>
            <RegisterPage />
        </MemoryRouter>
    )
    return userEvent.setup()
}

async function fillOwner(user) {
    await user.type(screen.getByLabelText('Nombre completo'), 'Ana Pérez')
    await user.type(screen.getByLabelText('Email'), 'ana@correo.com')
    await user.type(screen.getByLabelText('Contraseña'), 'secreto123')
}

describe('RegisterPage', () => {
    beforeEach(() => vi.resetAllMocks())

    it('asks for the license only for veterinarians', async () => {
        const user = renderPage()
        expect(screen.queryByLabelText('Número de licencia profesional')).not.toBeInTheDocument()

        await user.click(screen.getByLabelText(/veterinario/i))

        expect(screen.getByLabelText('Número de licencia profesional')).toBeRequired()
    })

    it('sends the chosen role and the license', async () => {
        axiosClient.post.mockResolvedValue({ data: { token: 't' } })
        const user = renderPage()

        await user.click(screen.getByLabelText(/veterinario/i))
        await fillOwner(user)
        await user.type(screen.getByLabelText('Número de licencia profesional'), 'VET-1')
        await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

        expect(axiosClient.post).toHaveBeenCalledWith('/api/auth/register', {
            name: 'Ana Pérez',
            email: 'ana@correo.com',
            password: 'secreto123',
            role: 'VETERINARIAN',
            licenseNumber: 'VET-1',
        })
    })

    it('explains in Spanish that the email is already registered', async () => {
        axiosClient.post.mockRejectedValue({ isAxiosError: true, response: { status: 409, data: { error: 'Conflict' } } })
        const user = renderPage()

        await fillOwner(user)
        await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

        expect(await screen.findByRole('alert')).toHaveTextContent('Ya existe una cuenta con ese email.')
    })
})