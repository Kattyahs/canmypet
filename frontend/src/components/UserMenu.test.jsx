import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UserMenu from './UserMenu'

const USER = { name: 'Kattya Herrera', role: 'OWNER' }

function renderMenu(props = {}) {
    const onLogout = vi.fn()
    render(
        <div>
            <p>Fuera del menú</p>
            <UserMenu user={USER} onLogout={onLogout} {...props} />
        </div>
    )
    return { onLogout, trigger: screen.getByRole('button', { name: 'Menú de Kattya Herrera' }) }
}

describe('UserMenu', () => {
    it('opens on click and stays open without hovering', async () => {
        const user = userEvent.setup()
        const { trigger } = renderMenu()

        expect(trigger).toHaveAttribute('aria-expanded', 'false')
        expect(screen.queryByRole('menuitem', { name: /cerrar sesión/i })).not.toBeInTheDocument()

        await user.click(trigger)

        expect(trigger).toHaveAttribute('aria-expanded', 'true')
        expect(screen.getByRole('menuitem', { name: /cerrar sesión/i })).toHaveFocus()
    })

    it('logs out when the menu item is chosen', async () => {
        const user = userEvent.setup()
        const { trigger, onLogout } = renderMenu()

        await user.click(trigger)
        await user.click(screen.getByRole('menuitem', { name: /cerrar sesión/i }))

        expect(onLogout).toHaveBeenCalledTimes(1)
    })

    it('closes with Escape and returns focus to the trigger', async () => {
        const user = userEvent.setup()
        const { trigger } = renderMenu()

        await user.click(trigger)
        await user.keyboard('{Escape}')

        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
        expect(trigger).toHaveFocus()
    })

    it('closes when clicking outside', async () => {
        const user = userEvent.setup()
        const { trigger } = renderMenu()

        await user.click(trigger)
        await user.click(screen.getByText('Fuera del menú'))

        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })

    it('can be operated with the keyboard only', async () => {
        const user = userEvent.setup()
        const { onLogout } = renderMenu()

        await user.tab()
        await user.keyboard('{Enter}')
        await user.keyboard('{Enter}')

        expect(onLogout).toHaveBeenCalledTimes(1)
    })

    it('shows the name inside the menu in the compact mobile version', async () => {
        const user = userEvent.setup()
        const { trigger } = renderMenu({ placement: 'down' })

        expect(screen.queryByText('Kattya Herrera')).not.toBeInTheDocument()
        await user.click(trigger)

        expect(screen.getByRole('menu')).toHaveTextContent('Kattya Herrera')
    })
})