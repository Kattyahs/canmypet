import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FoodsTab from './FoodsTab'
import { getAllFoods, createFood, updateFood } from '../../api/foods'

vi.mock('../../api/foods', () => ({
    getAllFoods: vi.fn(),
    createFood: vi.fn(),
    updateFood: vi.fn(),
}))

const pageOf = (content, page = 0, totalPages = 1) => ({
    content,
    page,
    size: 10,
    totalElements: content.length,
    totalPages,
})

const CHOCOLATE = { id: 1, name: 'Chocolate', category: 'dulce', description: 'Contiene teobromina' }
const GRAPES = { id: 2, name: 'Uvas', category: 'fruta', description: null }

describe('FoodsTab', () => {
    beforeEach(() => {
        vi.resetAllMocks()
        getAllFoods.mockResolvedValue({ data: pageOf([CHOCOLATE, GRAPES]) })
    })

    it('loads the first page of the catalog without a filter', async () => {
        render(<FoodsTab />)

        expect(await screen.findByText('Chocolate')).toBeInTheDocument()
        expect(screen.getByText('Uvas')).toBeInTheDocument()
        expect(getAllFoods).toHaveBeenCalledWith({ query: undefined, page: 0, size: 10 })
    })

    it('searches by name starting again from the first page', async () => {
        getAllFoods
            .mockResolvedValueOnce({ data: pageOf([CHOCOLATE], 0, 2) })
            .mockResolvedValueOnce({ data: pageOf([GRAPES], 1, 2) })
            .mockResolvedValueOnce({ data: pageOf([CHOCOLATE]) })
        const user = userEvent.setup()

        render(<FoodsTab />)
        await screen.findByText('Chocolate')
        await user.click(screen.getByRole('button', { name: /siguiente/i }))
        await screen.findByText('Uvas')

        await user.type(screen.getByLabelText('Buscar alimento en el catálogo'), '  cho ')
        await user.click(screen.getByRole('button', { name: 'Buscar' }))

        expect(await screen.findByText('Chocolate')).toBeInTheDocument()
        expect(getAllFoods).toHaveBeenLastCalledWith({ query: 'cho', page: 0, size: 10 })
    })

    it('tells the admin when a search has no results', async () => {
        getAllFoods
            .mockResolvedValueOnce({ data: pageOf([CHOCOLATE]) })
            .mockResolvedValueOnce({ data: pageOf([]) })
        const user = userEvent.setup()

        render(<FoodsTab />)
        await screen.findByText('Chocolate')
        await user.type(screen.getByLabelText('Buscar alimento en el catálogo'), 'palta')
        await user.click(screen.getByRole('button', { name: 'Buscar' }))

        expect(await screen.findByText('No hay alimentos que coincidan con "palta"')).toBeInTheDocument()
    })

    it('creates a food and reloads the catalog', async () => {
        createFood.mockResolvedValue({ data: { id: 3, name: 'Cebolla', category: 'verdura', description: null } })
        const user = userEvent.setup()

        render(<FoodsTab />)
        await screen.findByText('Chocolate')
        await user.click(screen.getByRole('button', { name: /nuevo alimento/i }))

        const form = screen.getByRole('form', { name: 'Nuevo alimento' })
        await user.type(within(form).getByLabelText('Nombre'), ' Cebolla ')
        await user.type(within(form).getByLabelText('Categoría'), 'verdura')
        await user.click(within(form).getByRole('button', { name: 'Crear alimento' }))

        expect(createFood).toHaveBeenCalledWith({ name: 'Cebolla', category: 'verdura', description: null })
        expect(await screen.findByText('"Cebolla" se agregó al catálogo.')).toBeInTheDocument()
        expect(screen.queryByRole('form', { name: 'Nuevo alimento' })).not.toBeInTheDocument()
        expect(getAllFoods).toHaveBeenCalledTimes(2)
    })

    it('does not submit a new food without name and category', async () => {
        const user = userEvent.setup()

        render(<FoodsTab />)
        await screen.findByText('Chocolate')
        await user.click(screen.getByRole('button', { name: /nuevo alimento/i }))
        await user.click(screen.getByRole('button', { name: 'Crear alimento' }))

        expect(screen.getByText('Completa el nombre y la categoría.')).toBeInTheDocument()
        expect(createFood).not.toHaveBeenCalled()
    })

    it('edits a food in place and keeps the current page', async () => {
        getAllFoods
            .mockResolvedValueOnce({ data: pageOf([CHOCOLATE], 0, 2) })
            .mockResolvedValueOnce({ data: pageOf([GRAPES], 1, 2) })
            .mockResolvedValueOnce({ data: pageOf([{ ...GRAPES, description: 'Y pasas' }], 1, 2) })
        updateFood.mockResolvedValue({ data: { ...GRAPES, description: 'Y pasas' } })
        const user = userEvent.setup()

        render(<FoodsTab />)
        await screen.findByText('Chocolate')
        await user.click(screen.getByRole('button', { name: /siguiente/i }))
        await user.click(await screen.findByRole('button', { name: 'Editar Uvas' }))

        const form = screen.getByRole('form', { name: 'Editar Uvas' })
        expect(within(form).getByLabelText('Nombre')).toHaveValue('Uvas')
        await user.type(within(form).getByLabelText('Descripción'), 'Y pasas')
        await user.click(within(form).getByRole('button', { name: 'Guardar cambios' }))

        expect(updateFood).toHaveBeenCalledWith(2, { name: 'Uvas', category: 'fruta', description: 'Y pasas' })
        expect(await screen.findByText('"Uvas" se actualizó.')).toBeInTheDocument()
        expect(await screen.findByText('Y pasas')).toBeInTheDocument()
        expect(getAllFoods).toHaveBeenLastCalledWith({ query: undefined, page: 1, size: 10 })
    })

    it('shows the server error inside the edit form', async () => {
        updateFood.mockRejectedValue({ isAxiosError: true, response: { status: 404 } })
        const user = userEvent.setup()

        render(<FoodsTab />)
        await user.click(await screen.findByRole('button', { name: 'Editar Chocolate' }))
        await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

        expect(await screen.findByText('Este alimento ya no existe. Recarga la lista.')).toBeInTheDocument()
        expect(screen.getByRole('form', { name: 'Editar Chocolate' })).toBeInTheDocument()
    })
})