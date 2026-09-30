import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Modal from './Modal'

function renderModal(props = {}) {
    const onClose = vi.fn()
    render(
        <>
            <button type="button">Abrir</button>
            <Modal open title="Nueva mascota" onClose={onClose} {...props}>
                <input aria-label="Nombre" />
                <button type="button">Guardar</button>
            </Modal>
        </>
    )
    return { onClose }
}

describe('Modal', () => {
    it('renders nothing when closed', () => {
        render(
            <Modal open={false} title="Nueva mascota" onClose={() => {}}>
                <p>Contenido</p>
            </Modal>
        )
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('is a labelled modal dialog', () => {
        renderModal()
        const dialog = screen.getByRole('dialog', { name: 'Nueva mascota' })
        expect(dialog).toHaveAttribute('aria-modal', 'true')
    })

    it('closes with Escape and with the close button', async () => {
        const user = userEvent.setup()
        const { onClose } = renderModal()
        await user.keyboard('{Escape}')
        await user.click(screen.getByRole('button', { name: 'Cerrar' }))
        expect(onClose).toHaveBeenCalledTimes(2)
    })

    it('ignores Escape while it cannot be dismissed', async () => {
        const user = userEvent.setup()
        const { onClose } = renderModal({ dismissible: false })
        await user.keyboard('{Escape}')
        expect(onClose).not.toHaveBeenCalled()
    })

    it('keeps the focus inside the dialog', async () => {
        const user = userEvent.setup()
        renderModal()
        screen.getByRole('button', { name: 'Guardar' }).focus()
        await user.tab()
        expect(screen.getByRole('button', { name: 'Cerrar' })).toHaveFocus()
    })
})