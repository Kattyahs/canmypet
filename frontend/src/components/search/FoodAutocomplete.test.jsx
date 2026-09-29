import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FoodAutocomplete from './FoodAutocomplete'
import { searchFoods } from '../../api/foods'

vi.mock('../../api/foods', () => ({ searchFoods: vi.fn() }))

const PLATANO = { id: 46, name: 'Plátano', category: 'fruit' }

function Harness({ onSelect }) {
    const [query, setQuery] = useState('')
    return <FoodAutocomplete id="food" label="Alimento" query={query} onQueryChange={setQuery} onSelect={onSelect} />
}

describe('FoodAutocomplete', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it('selects the suggestion with Enter', async () => {
        const user = userEvent.setup()
        const onSelect = vi.fn()
        searchFoods.mockResolvedValue({ data: [PLATANO] })
        render(<Harness onSelect={onSelect} />)

        await user.type(screen.getByRole('textbox'), 'platano')
        await screen.findByRole('button', { name: /plátano/i })
        await user.keyboard('{Enter}')

        expect(onSelect).toHaveBeenCalledWith(PLATANO)
    })

    it('names what was not found', async () => {
        const user = userEvent.setup()
        searchFoods.mockResolvedValue({ data: [] })
        render(<Harness onSelect={vi.fn()} />)

        await user.type(screen.getByRole('textbox'), 'kiwi')

        expect(await screen.findByText(/no encontramos «kiwi»/i)).toBeInTheDocument()
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('does not confuse a failed search with an empty result', async () => {
        const user = userEvent.setup()
        searchFoods.mockRejectedValue(new Error('Network Error'))
        render(<Harness onSelect={vi.fn()} />)

        await user.type(screen.getByRole('textbox'), 'kiwi')

        expect(await screen.findByRole('alert')).toHaveTextContent(/no pudimos buscar/i)
        expect(screen.queryByText(/no encontramos/i)).not.toBeInTheDocument()
    })
})