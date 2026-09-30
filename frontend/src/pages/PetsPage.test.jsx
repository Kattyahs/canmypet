import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import PetsPage from './PetsPage'
import { getMyPets } from '../api/pets'

vi.mock('../api/pets', () => ({ getMyPets: vi.fn(), createPet: vi.fn(), updatePet: vi.fn() }))

function renderPage() {
    return render(
        <MemoryRouter>
            <PetsPage />
        </MemoryRouter>
    )
}

describe('PetsPage', () => {
    beforeEach(() => vi.resetAllMocks())

    it('shows the life stage in Spanish', async () => {
        getMyPets.mockResolvedValue({ data: [{ id: 1, name: 'Popi', species: 'DOG', lifeStage: 'PUPPY' }] })
        renderPage()
        expect(await screen.findByText('Cachorro')).toBeInTheDocument()
        expect(screen.getByText('Perro')).toBeInTheDocument()
    })

    it('invites to register the first pet when there are none', async () => {
        getMyPets.mockResolvedValue({ data: [] })
        renderPage()
        expect(await screen.findByText('Aún no tienes mascotas registradas')).toBeInTheDocument()
    })

    it('lets the user retry when the pets cannot be loaded', async () => {
        getMyPets
            .mockRejectedValueOnce({ isAxiosError: true })
            .mockResolvedValue({ data: [{ id: 1, name: 'Popi', species: 'DOG', lifeStage: null }] })
        const user = userEvent.setup()
        renderPage()

        expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo conectar con el servidor.')
        await user.click(screen.getByRole('button', { name: 'Reintentar' }))
        expect(await screen.findByText('Popi')).toBeInTheDocument()
    })
})