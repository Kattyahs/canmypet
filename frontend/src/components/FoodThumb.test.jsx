import { describe, it, expect } from 'vitest'
import { fireEvent, render } from '@testing-library/react'
import FoodThumb from './FoodThumb'

describe('FoodThumb', () => {
    it('shows the food photo when there is one', () => {
        const { container } = render(<FoodThumb name="Palta" category="fruit" />)
        expect(container.querySelector('img')).toHaveAttribute(
            'src',
            'https://www.themealdb.com/images/ingredients/Avocado-Small.png'
        )
    })

    it('falls back to the category icon when the photo does not load', () => {
        const { container } = render(<FoodThumb name="Palta" category="fruit" />)
        fireEvent.error(container.querySelector('img'))
        expect(container.querySelector('img')).toBeNull()
        expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('shows the category icon for foods without a photo', () => {
        const { container } = render(<FoodThumb name="Xilitol" category="sweets" />)
        expect(container.querySelector('img')).toBeNull()
        expect(container.querySelector('svg.lucide-candy')).toBeInTheDocument()
    })
})