import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SegmentedTabs from './SegmentedTabs'

const OPTIONS = [
    { value: 'mine', label: 'Mis mascotas' },
    { value: 'all', label: 'Búsqueda general' },
    { value: 'pending', label: 'Pendientes', count: 3 },
]

describe('SegmentedTabs', () => {
    it('marks the current option as selected', () => {
        render(<SegmentedTabs options={OPTIONS} value="mine" onChange={() => {}} label="Modo" />)
        expect(screen.getByRole('tablist', { name: 'Modo' })).toBeInTheDocument()
        expect(screen.getByRole('tab', { name: 'Mis mascotas' })).toHaveAttribute('aria-selected', 'true')
        expect(screen.getByRole('tab', { name: 'Búsqueda general' })).toHaveAttribute('aria-selected', 'false')
    })

    it('shows the count next to the label', () => {
        render(<SegmentedTabs options={OPTIONS} value="mine" onChange={() => {}} label="Modo" />)
        expect(screen.getByRole('tab', { name: /pendientes\s*· 3/i })).toBeInTheDocument()
    })

    it('reports the clicked option', async () => {
        const onChange = vi.fn()
        render(<SegmentedTabs options={OPTIONS} value="mine" onChange={onChange} label="Modo" />)
        await userEvent.click(screen.getByRole('tab', { name: 'Búsqueda general' }))
        expect(onChange).toHaveBeenCalledWith('all')
    })

    it('moves with the arrow keys and wraps around', async () => {
        const onChange = vi.fn()
        render(<SegmentedTabs options={OPTIONS} value="mine" onChange={onChange} label="Modo" />)
        screen.getByRole('tab', { name: 'Mis mascotas' }).focus()
        await userEvent.keyboard('{ArrowLeft}')
        expect(onChange).toHaveBeenLastCalledWith('pending')
        await userEvent.keyboard('{ArrowRight}')
        expect(onChange).toHaveBeenLastCalledWith('mine')
    })
})