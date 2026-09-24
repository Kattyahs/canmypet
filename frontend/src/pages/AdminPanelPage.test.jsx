import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminPanelPage from './AdminPanelPage'
import { getUsers, verifyUser } from '../api/users'

vi.mock('../api/users', () => ({ getUsers: vi.fn(), verifyUser: vi.fn() }))

const pageOf = (content, page = 0, totalPages = 1) => ({
    content,
    page,
    size: 10,
    totalElements: content.length,
    totalPages,
})

const PENDING_VET = {
    id: 12,
    name: 'Mario Torres',
    email: 'mario@example.com',
    role: 'VETERINARIAN',
    licenseNumber: 'VET-4521',
    verified: false,
    createdAt: '2026-09-20T10:00:00',
}

describe('AdminPanelPage', () => {
    beforeEach(() => {
        vi.resetAllMocks()
        getUsers.mockResolvedValue({ data: pageOf([PENDING_VET]) })
    })

    it('asks the server for unverified veterinarians, oldest first', async () => {
        render(<AdminPanelPage />)

        expect(await screen.findByText('Mario Torres')).toBeInTheDocument()
        expect(screen.getByText(/VET-4521/)).toBeInTheDocument()
        expect(getUsers).toHaveBeenCalledWith({
            role: 'VETERINARIAN',
            verified: false,
            sort: 'createdAt,asc',
            page: 0,
            size: 10,
        })
    })

    it('approves a veterinarian and removes it from the pending list', async () => {
        getUsers
            .mockResolvedValueOnce({ data: pageOf([PENDING_VET]) })
            .mockResolvedValueOnce({ data: pageOf([]) })
        verifyUser.mockResolvedValue({ data: { ...PENDING_VET, verified: true } })
        const user = userEvent.setup()

        render(<AdminPanelPage />)
        await user.click(await screen.findByRole('button', { name: 'Aprobar a Mario Torres' }))

        expect(verifyUser).toHaveBeenCalledWith(12)
        expect(await screen.findByText('No hay veterinarios pendientes')).toBeInTheDocument()
        expect(screen.getByText('Mario Torres ya puede usar el panel veterinario.')).toBeInTheDocument()
        expect(getUsers).toHaveBeenCalledTimes(2)
    })

    it('shows the error next to the veterinarian when approval fails', async () => {
        verifyUser.mockRejectedValue({ isAxiosError: true, response: { status: 404 } })
        const user = userEvent.setup()

        render(<AdminPanelPage />)
        await user.click(await screen.findByRole('button', { name: 'Aprobar a Mario Torres' }))

        expect(await screen.findByText('Esta cuenta ya no existe. Recarga la lista.')).toBeInTheDocument()
        expect(screen.getByText('Mario Torres')).toBeInTheDocument()
        expect(getUsers).toHaveBeenCalledTimes(1)
    })

    it('shows an error with a retry option when loading fails', async () => {
        getUsers
            .mockRejectedValueOnce({ isAxiosError: true, response: { status: 500 } })
            .mockResolvedValueOnce({ data: pageOf([]) })
        const user = userEvent.setup()

        render(<AdminPanelPage />)

        expect(
            await screen.findByText('No se pudieron cargar los veterinarios pendientes.')
        ).toBeInTheDocument()
        await user.click(screen.getByRole('button', { name: /reintentar/i }))
        expect(await screen.findByText('No hay veterinarios pendientes')).toBeInTheDocument()
    })
})