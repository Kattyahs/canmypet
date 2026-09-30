import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import EmergencyFlowPage from './EmergencyFlowPage'
import { getMyPets } from '../api/pets'
import { getFoodsByIds, getFoodSafetyAllSpecies, searchFoods } from '../api/foods'
import { getEmergencyGuide } from '../api/emergency'

vi.mock('../api/pets', () => ({ getMyPets: vi.fn() }))
vi.mock('../api/foods', () => ({ getFoodsByIds: vi.fn(), getFoodSafetyAllSpecies: vi.fn(), searchFoods: vi.fn() }))
vi.mock('../components/emergency/NearbyClinics', () => ({ default: () => <section aria-label="Veterinarias cercanas" /> }))
vi.mock('../api/emergency', () => ({ getEmergencyGuide: vi.fn() }))

const POPI = { id: 1, name: 'Popi', species: 'DOG', lifeStage: 'ADULT' }
const CHOCOLATE = { id: 10, name: 'Chocolate', category: 'sweets' }
const DOG_TOXIC = { id: 100, foodId: 10, species: 'DOG', lifeStage: null, riskLevel: 'TOXIC', verifiedStatus: 'VERIFIED', notes: 'Contiene teobromina.' }

function renderAt(path = '/emergency/start') {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <EmergencyFlowPage />
        </MemoryRouter>
    )
}

describe('EmergencyFlowPage', () => {
    beforeEach(() => {
        vi.resetAllMocks()
        getMyPets.mockResolvedValue({ data: [POPI] })
        getFoodsByIds.mockResolvedValue({ data: [CHOCOLATE] })
        searchFoods.mockResolvedValue({ data: [CHOCOLATE] })
        getFoodSafetyAllSpecies.mockResolvedValue({ data: [DOG_TOXIC] })
        getEmergencyGuide.mockResolvedValue({
            data: { riskLevel: 'TOXIC', steps: 'Llama a tu veterinario.', emergencyContactsInfo: 'Clínica 24 h' },
        })
    })

    it('guides an owner through pet, food and time to what to do now', async () => {
        const user = userEvent.setup()
        renderAt()

        await user.click(await screen.findByRole('button', { name: /popi/i }))
        await user.type(screen.getByLabelText('Alimento'), 'choc')
        await user.click(await screen.findByRole('button', { name: /chocolate/i }))
        expect(screen.getByText('Paso 3 de 3')).toBeInTheDocument()
        await user.click(screen.getByRole('button', { name: 'Más de 6 horas' }))

        expect(await screen.findByRole('heading', { name: 'Llama a tu veterinario ahora' })).toBeInTheDocument()
        expect(screen.getByText(/síntomas tardíos/)).toBeInTheDocument()
        expect(screen.getByText('Llama a tu veterinario.')).toBeInTheDocument()
        expect(getEmergencyGuide).toHaveBeenCalledWith('TOXIC')
    })

    it('starts at the time question when coming from a search result', async () => {
        renderAt('/emergency/start?petId=1&foodId=10')
        expect(await screen.findByText('Paso 3 de 3')).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: '¿Hace cuánto tiempo?' })).toBeInTheDocument()
    })

    it('asks for the species when the animal is not one of the pets', async () => {
        getMyPets.mockResolvedValue({ data: [] })
        const user = userEvent.setup()
        renderAt()

        await user.click(await screen.findByRole('button', { name: 'Gato' }))
        expect(screen.getByRole('heading', { name: '¿Qué comió?' })).toBeInTheDocument()
    })

    it('recommends caution when the owner does not know what the pet ate', async () => {
        const user = userEvent.setup()
        renderAt('/emergency/start?petId=1')

        await user.click(await screen.findByRole('button', { name: /no sé qué comió/i }))
        await user.click(screen.getByRole('button', { name: 'No lo sé' }))

        expect(await screen.findByRole('heading', { name: 'Por precaución, llama a tu veterinario' })).toBeInTheDocument()
        expect(getFoodSafetyAllSpecies).not.toHaveBeenCalled()
    })

    it('does not show an emergency guide when the food is safe', async () => {
        getFoodSafetyAllSpecies.mockResolvedValue({ data: [{ ...DOG_TOXIC, riskLevel: 'SAFE' }] })
        const user = userEvent.setup()
        renderAt('/emergency/start?petId=1&foodId=10')

        await user.click(await screen.findByRole('button', { name: 'Menos de 30 minutos' }))

        expect(await screen.findByRole('heading', { name: 'No es tóxico' })).toBeInTheDocument()
        expect(getEmergencyGuide).not.toHaveBeenCalled()
    })

    it('goes back one question at a time', async () => {
        const user = userEvent.setup()
        renderAt('/emergency/start?petId=1&foodId=10')

        await user.click(await screen.findByRole('button', { name: 'Atrás' }))
        expect(screen.getByRole('heading', { name: '¿Qué comió?' })).toBeInTheDocument()
    })
})