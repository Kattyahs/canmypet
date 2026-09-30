import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from './LoginPage'
import axiosClient from '../api/axiosClient'

vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ login: vi.fn() }) }))
vi.mock('../api/axiosClient', () => ({ default: { post: vi.fn() } }))

async function submit() {
    const user = userEvent.setup()
    render(
        <MemoryRouter>
            <LoginPage />
        </MemoryRouter>
    )
    await user.type(screen.getByLabelText('Email'), 'ana@correo.com')
    await user.type(screen.getByLabelText('Contraseña'), 'secreto123')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
}

describe('LoginPage', () => {
    beforeEach(() => vi.resetAllMocks())

    it('reports wrong credentials', async () => {
        axiosClient.post.mockRejectedValue({ isAxiosError: true, response: { status: 401 } })
        await submit()
        expect(await screen.findByRole('alert')).toHaveTextContent('Email o contraseña incorrectos.')
    })

    it('reports a connection problem instead of wrong credentials', async () => {
        axiosClient.post.mockRejectedValue({ isAxiosError: true })
        await submit()
        expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo conectar con el servidor.')
    })

    it('lets the user show and hide the password', async () => {
        const user = userEvent.setup()
        render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        )
        const password = screen.getByLabelText('Contraseña')
        expect(password).toHaveAttribute('type', 'password')

        await user.click(screen.getByRole('button', { name: 'Mostrar contraseña' }))
        expect(password).toHaveAttribute('type', 'text')

        await user.click(screen.getByRole('button', { name: 'Ocultar contraseña' }))
        expect(password).toHaveAttribute('type', 'password')
    })
})