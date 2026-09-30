import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Button, { buttonClasses } from './Button'

describe('Button', () => {
    it('is a non-submitting button by default', () => {
        render(<Button>Guardar</Button>)
        expect(screen.getByRole('button', { name: 'Guardar' })).toHaveAttribute('type', 'button')
    })

    it('can submit a form when asked', () => {
        render(<Button type="submit">Enviar</Button>)
        expect(screen.getByRole('button', { name: 'Enviar' })).toHaveAttribute('type', 'submit')
    })

    it('builds classes for each variant and the full width option', () => {
        expect(buttonClasses()).toContain('bg-brand')
        expect(buttonClasses({ variant: 'outline' })).toContain('border-brand')
        expect(buttonClasses({ fullWidth: true })).toContain('w-full')
    })
})