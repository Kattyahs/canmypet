import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProposeEntryForm from './ProposeEntryForm'
import { searchFoods, createFoodSafety } from '../../api/foods'

vi.mock('../../api/foods', () => ({ searchFoods: vi.fn(), createFoodSafety: vi.fn() }))

const CHOCOLATE = { id: 1, name: 'Chocolate' }

function renderForm(props = {}) {
    return render(<ProposeEntryForm onCreated={vi.fn()} onCancel={vi.fn()} {...props} />)
}

describe('ProposeEntryForm', () => {
    beforeEach(() => {
        vi.resetAllMocks()
        searchFoods.mockResolvedValue({ data: [CHOCOLATE] })
    })

    it('does not search until two characters are typed', async () => {
        const user = userEvent.setup()
        renderForm()
        const input = screen.getByLabelText('Alimento')

        await user.type(input, 'c')
        expect(searchFoods).not.toHaveBeenCalled()

        await user.type(input, 'h')
        expect(searchFoods).toHaveBeenLastCalledWith('ch')
    })

    it('submits the id of the food chosen from the suggestions', async () => {
        const onCreated = vi.fn()
        createFoodSafety.mockResolvedValue({ data: {} })
        const user = userEvent.setup()
        renderForm({ onCreated })

        await user.type(screen.getByLabelText('Alimento'), 'cho')
        await user.click(await screen.findByRole('button', { name: 'Chocolate' }))
        await user.selectOptions(screen.getByLabelText('Especie'), 'CAT')
        await user.click(screen.getByLabelText(/toxic/i))
        await user.click(screen.getByRole('button', { name: 'Crear entrada' }))

        expect(createFoodSafety).toHaveBeenCalledWith(
            expect.objectContaining({ foodId: 1, species: 'CAT', riskLevel: 'TOXIC', lifeStage: null })
        )
        await waitFor(() => expect(onCreated).toHaveBeenCalled())
    })

    it('rejects a typed name that was not chosen from the list', async () => {
        const user = userEvent.setup()
        renderForm()

        await user.type(screen.getByLabelText('Alimento'), 'Chocolate')
        await user.selectOptions(screen.getByLabelText('Especie'), 'CAT')
        await user.click(screen.getByLabelText(/toxic/i))
        await user.click(screen.getByRole('button', { name: 'Crear entrada' }))

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Elige un alimento de la lista de sugerencias.'
        )
        expect(createFoodSafety).not.toHaveBeenCalled()
    })

    it('ignores an older search response that arrives late', async () => {
        let resolveFirst
        searchFoods
            .mockImplementationOnce(() => new Promise((resolve) => (resolveFirst = resolve)))
            .mockResolvedValue({ data: [{ id: 3, name: 'Choclo' }] })
        const user = userEvent.setup()
        renderForm()
        const input = screen.getByLabelText('Alimento')

        await user.type(input, 'ch')
        await user.type(input, 'o')
        expect(await screen.findByRole('button', { name: 'Choclo' })).toBeInTheDocument()

        await act(async () => {
            resolveFirst({ data: [CHOCOLATE] })
        })
        expect(screen.queryByRole('button', { name: 'Chocolate' })).not.toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Choclo' })).toBeInTheDocument()
    })
})