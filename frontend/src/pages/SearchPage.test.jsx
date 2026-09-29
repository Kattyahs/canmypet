import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import SearchPage from './SearchPage'
import { useAuth } from '../context/AuthContext'
import { searchFoods, getFoodSafetyAllSpecies, getFoodsByIds } from '../api/foods'
import { getMyPets } from '../api/pets'
import { recordSearch, getMyHistory } from '../api/searchHistory'

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../api/foods', () => ({ searchFoods: vi.fn(), getFoodSafetyAllSpecies: vi.fn(), getFoodsByIds: vi.fn() }))
vi.mock('../api/pets', () => ({ getMyPets: vi.fn() }))
vi.mock('../api/searchHistory', () => ({ recordSearch: vi.fn(), getMyHistory: vi.fn() }))

const POPI = { id: 1, name: 'Popi', species: 'DOG', lifeStage: 'ADULT' }
const MICHI = { id: 2, name: 'Michi', species: 'CAT', lifeStage: 'SENIOR' }
const CHOCOLATE = { id: 10, name: 'Chocolate', category: 'Dulces' }
const GRAPES = { id: 11, name: 'Uvas y pasas', category: 'Frutas' }

const historyPage = (content) => ({ data: { content, page: 0, size: 10, totalElements: content.length, totalPages: 1 } })


const entry = (overrides) => ({
    foodId: 10,
    foodName: 'Chocolate',
    lifeStage: null,
    verifiedStatus: 'VERIFIED',
    notes: '',
    sources: [],
    ...overrides,
})

const ENTRIES = [
    entry({ id: 100, species: 'DOG', riskLevel: 'TOXIC', notes: 'Contiene teobromina.' }),
    entry({ id: 101, species: 'CAT', riskLevel: 'MODERATE' }),
    entry({ id: 102, species: 'DOG', lifeStage: 'PUPPY', riskLevel: 'LETHAL' }),
    entry({ id: 103, species: 'RABBIT', riskLevel: 'TOXIC', verifiedStatus: 'PENDING' }),
]

function renderPage(path = '/search') {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <SearchPage />
        </MemoryRouter>
    )
}

async function chooseChocolate(user) {
    await user.type(screen.getByRole('textbox'), 'cho')
    await user.click(await screen.findByRole('button', { name: /chocolate/i }))
}

describe('SearchPage', () => {
    beforeEach(() => {
        vi.resetAllMocks()
        useAuth.mockReturnValue({ user: { name: 'Kattya Herrera', role: 'OWNER' } })
        getMyPets.mockResolvedValue({ data: [POPI, MICHI] })
        searchFoods.mockResolvedValue({ data: [CHOCOLATE] })
        getFoodSafetyAllSpecies.mockResolvedValue({ data: ENTRIES })
        recordSearch.mockResolvedValue({ data: {} })
        getMyHistory.mockResolvedValue(historyPage([]))
        getFoodsByIds.mockResolvedValue({ data: [] })
    })

    it('opens on the pets tab when the owner has pets', async () => {
        renderPage()

        expect(await screen.findByRole('button', { name: /popi/i })).toBeInTheDocument()
        expect(screen.getByRole('tab', { name: /mis mascotas/i })).toHaveAttribute('aria-selected', 'true')
    })

    it('opens on the general search when the owner has no pets', async () => {
        getMyPets.mockResolvedValue({ data: [] })
        renderPage()

        expect(await screen.findByRole('tab', { name: /buscador general/i })).toHaveAttribute('aria-selected', 'true')
        expect(screen.getByLabelText('Especie')).toBeInTheDocument()
    })

    it('shows a single verdict for the chosen pet and records the search once', async () => {
        const user = userEvent.setup()
        renderPage()

        await user.click(await screen.findByRole('button', { name: /popi/i }))
        await chooseChocolate(user)

        expect(await screen.findByRole('heading', { name: 'No. Es tóxico' })).toBeInTheDocument()
        expect(screen.getByText('Contiene teobromina.')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /ya lo comió/i })).toHaveAttribute('href', '/emergency/TOXIC')
        expect(recordSearch).toHaveBeenCalledWith({ petId: 1, foodId: 10 })
        expect(recordSearch).toHaveBeenCalledTimes(1)
    })

    it('switches pets without asking the server again', async () => {
        const user = userEvent.setup()
        renderPage()

        await user.click(await screen.findByRole('button', { name: /popi/i }))
        await chooseChocolate(user)
        await screen.findByRole('heading', { name: 'No. Es tóxico' })

        await user.click(screen.getByRole('button', { name: /michi/i }))

        expect(screen.getByRole('heading', { name: 'Solo con precaución' })).toBeInTheDocument()
        expect(getFoodSafetyAllSpecies).toHaveBeenCalledTimes(1)
        expect(recordSearch).toHaveBeenLastCalledWith({ petId: 2, foodId: 10 })
    })

    it('says when the general entry is used because there is none for the pet stage', async () => {
        const user = userEvent.setup()
        renderPage()

        await user.click(await screen.findByRole('button', { name: /michi/i }))
        await chooseChocolate(user)

        expect(await screen.findByText(/no hay una evaluación específica para la etapa senior/i)).toBeInTheDocument()
    })

    it('preselects the pet from the address', async () => {
        const user = userEvent.setup()
        renderPage('/search?petId=2')

        expect(await screen.findByRole('button', { name: /michi/i })).toHaveAttribute('aria-pressed', 'true')
        await chooseChocolate(user)
        expect(await screen.findByRole('heading', { name: 'Solo con precaución' })).toBeInTheDocument()
    })

    it('keeps the food when moving to the general search and lists every species by risk', async () => {
        const user = userEvent.setup()
        renderPage()

        await user.click(await screen.findByRole('button', { name: /popi/i }))
        await chooseChocolate(user)
        await screen.findByRole('heading', { name: 'No. Es tóxico' })

        await user.click(screen.getByRole('button', { name: /ver cómo afecta a otras especies/i }))

        expect(screen.getByRole('tab', { name: /buscador general/i })).toHaveAttribute('aria-selected', 'true')
        expect(screen.getByRole('textbox')).toHaveValue('Chocolate')
        const rows = within(screen.getByRole('table')).getAllByRole('row').slice(1)
        expect(rows.map((row) => within(row).getAllByRole('cell')[2].textContent)).toEqual([
            'LETHAL',
            'TOXIC',
            'TOXIC',
            'MODERATE',
        ])
        expect(screen.getAllByText('Sin revisar aún').length).toBeGreaterThan(0)
        expect(recordSearch).toHaveBeenLastCalledWith({ foodId: 10, species: null, lifeStage: null })
    })

    it('shows the verdict for a species chosen in the general search', async () => {
        const user = userEvent.setup()
        getMyPets.mockResolvedValue({ data: [] })
        renderPage()

        const stage = await screen.findByLabelText('Etapa de vida')
        expect(stage).toBeDisabled()

        await chooseChocolate(user)
        await user.selectOptions(screen.getByLabelText('Especie'), 'DOG')
        await user.selectOptions(stage, 'PUPPY')

        expect(screen.getByRole('heading', { name: 'No. Es muy peligroso' })).toBeInTheDocument()
    })
    it('records each species and stage combination of the general search once', async () => {
        const user = userEvent.setup()
        getMyPets.mockResolvedValue({ data: [] })
        renderPage()

        await screen.findByLabelText('Especie')
        await chooseChocolate(user)
        await user.selectOptions(screen.getByLabelText('Especie'), 'DOG')
        await user.selectOptions(screen.getByLabelText('Etapa de vida'), 'PUPPY')
        await user.selectOptions(screen.getByLabelText('Etapa de vida'), '')
        await user.selectOptions(screen.getByLabelText('Etapa de vida'), 'PUPPY')

        expect(recordSearch.mock.calls.map(([payload]) => payload)).toEqual([
            { foodId: 10, species: null, lifeStage: null },
            { foodId: 10, species: 'DOG', lifeStage: null },
            { foodId: 10, species: 'DOG', lifeStage: 'PUPPY' },
        ])
    })

    it('never renders a non-http source as a link', async () => {
        const user = userEvent.setup()
        getFoodSafetyAllSpecies.mockResolvedValue({
            data: [
                entry({
                    id: 100,
                    species: 'DOG',
                    riskLevel: 'TOXIC',
                    sources: [
                        { id: 1, sourceName: 'ASPCA', sourceUrl: 'https://www.aspca.org' },
                        { id: 2, sourceName: 'Fuente rara', sourceUrl: 'javascript:alert(1)' },
                    ],
                }),
            ],
        })
        renderPage()

        await user.click(await screen.findByRole('button', { name: /popi/i }))
        await chooseChocolate(user)

        expect(await screen.findByRole('link', { name: /aspca/i })).toHaveAttribute('href', 'https://www.aspca.org')
        expect(screen.queryByRole('link', { name: /fuente rara/i })).not.toBeInTheDocument()
    })

    it('shows recent consultations without repeats and the emergency banner before searching', async () => {
        getMyHistory.mockResolvedValue(
            historyPage([
                { id: 5, petId: 1, foodId: 10, searchedAt: '2026-09-24T10:00:00' },
                { id: 4, petId: 1, foodId: 10, searchedAt: '2026-09-23T10:00:00' },
                { id: 3, petId: null, foodId: 11, searchedAt: '2026-09-22T10:00:00' },
                { id: 2, petId: null, foodId: 11, species: 'CAT', lifeStage: 'SENIOR', searchedAt: '2026-09-21T10:00:00' },
            ])
        )
        getFoodsByIds.mockResolvedValue({ data: [CHOCOLATE, GRAPES] })
        renderPage()

        const recent = await screen.findByRole('region', { name: 'Consultas recientes' })
        expect(within(recent).getAllByRole('listitem')).toHaveLength(3)
        expect(within(recent).getByText(/popi · perro · adulto ·/i)).toBeInTheDocument()
        expect(within(recent).getByText(/todas las especies ·/i)).toBeInTheDocument()
        expect(within(recent).getByText(/gato · senior ·/i)).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /abrir guía de emergencia/i })).toHaveAttribute('href', '/emergency')
    })

    it('repeats a consultation for the same pet', async () => {
        const user = userEvent.setup()
        getMyHistory.mockResolvedValue(historyPage([{ id: 5, petId: 2, foodId: 10, searchedAt: '2026-09-24T10:00:00' }]))
        getFoodsByIds.mockResolvedValue({ data: [CHOCOLATE] })
        renderPage()

        await user.click(await screen.findByRole('button', { name: 'Consultar de nuevo Chocolate para Michi' }))

        expect(await screen.findByRole('heading', { name: 'Solo con precaución' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /michi/i })).toHaveAttribute('aria-pressed', 'true')
        expect(screen.queryByRole('region', { name: 'Consultas recientes' })).not.toBeInTheDocument()
    })

    it('repeats a general consultation in the general search', async () => {
        const user = userEvent.setup()
        getMyHistory.mockResolvedValue(historyPage([{ id: 3, petId: null, foodId: 10, searchedAt: '2026-09-22T10:00:00' }]))
        getFoodsByIds.mockResolvedValue({ data: [CHOCOLATE] })
        renderPage()

        await user.click(await screen.findByRole('button', { name: 'Consultar de nuevo Chocolate' }))

        expect(screen.getByRole('tab', { name: /buscador general/i })).toHaveAttribute('aria-selected', 'true')
        expect(await screen.findByRole('table')).toBeInTheDocument()
    })
    it('repeats a general consultation restoring its species and stage', async () => {
        const user = userEvent.setup()
        getMyHistory.mockResolvedValue(
            historyPage([{ id: 3, petId: null, foodId: 10, species: 'DOG', lifeStage: 'PUPPY', searchedAt: '2026-09-22T10:00:00' }])
        )
        getFoodsByIds.mockResolvedValue({ data: [CHOCOLATE] })
        renderPage()

        await user.click(await screen.findByRole('button', { name: 'Consultar de nuevo Chocolate para Perro · Cachorro' }))

        expect(screen.getByRole('tab', { name: /buscador general/i })).toHaveAttribute('aria-selected', 'true')
        expect(screen.getByLabelText('Especie')).toHaveValue('DOG')
        expect(screen.getByLabelText('Etapa de vida')).toHaveValue('PUPPY')
        expect(await screen.findByRole('heading', { name: 'No. Es muy peligroso' })).toBeInTheDocument()
        expect(recordSearch).toHaveBeenLastCalledWith({ foodId: 10, species: 'DOG', lifeStage: 'PUPPY' })
    })
})