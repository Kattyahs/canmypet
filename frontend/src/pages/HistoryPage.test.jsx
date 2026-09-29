import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HistoryPage from './HistoryPage'
import { getMyHistory } from '../api/searchHistory'
import { getFoodsByIds } from '../api/foods'
import { getMyPets } from '../api/pets'

vi.mock('../api/searchHistory', () => ({ getMyHistory: vi.fn() }))
vi.mock('../api/foods', () => ({ getFoodsByIds: vi.fn() }))
vi.mock('../api/pets', () => ({ getMyPets: vi.fn() }))

const POPI = { id: 1, name: 'Popi', species: 'DOG', lifeStage: 'ADULT' }

const historyPage = (content) => ({ data: { content, page: 0, size: 20, totalElements: content.length, totalPages: 1 } })

function renderPage() {
    return render(
        <MemoryRouter>
            <HistoryPage />
        </MemoryRouter>
    )
}

describe('HistoryPage', () => {
    beforeEach(() => {
        vi.resetAllMocks()
        getMyPets.mockResolvedValue({ data: [POPI] })
        getFoodsByIds.mockResolvedValue({
            data: [
                { id: 10, name: 'Chocolate' },
                { id: 11, name: 'Uvas' },
                { id: 12, name: 'Palta' },
            ],
        })
    })

    it('describes each consultation with its pet, species and stage in Spanish', async () => {
        getMyHistory.mockResolvedValue(
            historyPage([
                { id: 3, petId: 1, foodId: 10, species: 'DOG', lifeStage: 'ADULT', searchedAt: '2026-09-24T10:00:00' },
                { id: 2, petId: null, foodId: 11, species: 'CAT', lifeStage: 'SENIOR', searchedAt: '2026-09-23T10:00:00' },
                { id: 1, petId: null, foodId: 12, species: null, lifeStage: null, searchedAt: '2026-09-22T10:00:00' },
            ])
        )
        renderPage()

        expect(await screen.findByText('Popi · Perro · Adulto')).toBeInTheDocument()
        expect(screen.getByText('Gato · Senior')).toBeInTheDocument()
        expect(screen.getByText('Todas las especies')).toBeInTheDocument()
        expect(screen.queryByText(/ADULT|SENIOR/)).not.toBeInTheDocument()
    })

    it('keeps the species of a consultation whose pet was deleted', async () => {
        getMyHistory.mockResolvedValue(
            historyPage([{ id: 1, petId: null, foodId: 10, species: 'DOG', lifeStage: 'PUPPY', searchedAt: '2026-09-24T10:00:00' }])
        )
        renderPage()

        expect(await screen.findByText('Chocolate')).toBeInTheDocument()
        expect(screen.getByText('Perro · Cachorro')).toBeInTheDocument()
        expect(screen.queryByRole('link', { name: /consultar de nuevo/i })).not.toBeInTheDocument()
    })

    it('offers to repeat a consultation for a pet', async () => {
        getMyHistory.mockResolvedValue(
            historyPage([{ id: 3, petId: 1, foodId: 10, species: 'DOG', lifeStage: 'ADULT', searchedAt: '2026-09-24T10:00:00' }])
        )
        renderPage()

        expect(await screen.findByRole('link', { name: /consultar de nuevo/i })).toHaveAttribute('href', '/search?petId=1')
    })
})