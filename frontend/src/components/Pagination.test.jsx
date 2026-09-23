import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Pagination from './Pagination'

describe('Pagination', () => {
    it('renders nothing when there is a single page', () => {
        const { container } = render(<Pagination page={0} totalPages={1} onPageChange={vi.fn()} />)
        expect(container).toBeEmptyDOMElement()
    })

    it('shows the current page 1-based', () => {
        render(<Pagination page={1} totalPages={5} onPageChange={vi.fn()} />)
        expect(screen.getByText('Página 2 de 5')).toBeInTheDocument()
    })

    it('disables "Anterior" on the first page and "Siguiente" on the last', () => {
        const { rerender } = render(<Pagination page={0} totalPages={3} onPageChange={vi.fn()} />)
        expect(screen.getByRole('button', { name: /anterior/i })).toBeDisabled()
        expect(screen.getByRole('button', { name: /siguiente/i })).toBeEnabled()

        rerender(<Pagination page={2} totalPages={3} onPageChange={vi.fn()} />)
        expect(screen.getByRole('button', { name: /anterior/i })).toBeEnabled()
        expect(screen.getByRole('button', { name: /siguiente/i })).toBeDisabled()
    })

    it('asks for the adjacent page', async () => {
        const onPageChange = vi.fn()
        const user = userEvent.setup()
        render(<Pagination page={1} totalPages={3} onPageChange={onPageChange} />)

        await user.click(screen.getByRole('button', { name: /siguiente/i }))
        expect(onPageChange).toHaveBeenLastCalledWith(2)

        await user.click(screen.getByRole('button', { name: /anterior/i }))
        expect(onPageChange).toHaveBeenLastCalledWith(0)
    })
})