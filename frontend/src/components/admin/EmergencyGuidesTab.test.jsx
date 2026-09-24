import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EmergencyGuidesTab from './EmergencyGuidesTab'
import { getEmergencyGuide, saveEmergencyGuide } from '../../api/emergency'

vi.mock('../../api/emergency', () => ({ getEmergencyGuide: vi.fn(), saveEmergencyGuide: vi.fn() }))

const GUIDES = {
    MODERATE: { id: 1, riskLevel: 'MODERATE', steps: 'Observa a tu mascota', emergencyContactsInfo: null },
    TOXIC: { id: 2, riskLevel: 'TOXIC', steps: 'Llama al veterinario', emergencyContactsInfo: 'Clinica 24h' },
}

const notFound = { isAxiosError: true, response: { status: 404 } }

const card = (level) => screen.getByRole('region', { name: level })

async function renderLoaded() {
    render(<EmergencyGuidesTab />)
    await screen.findByDisplayValue('Llama al veterinario')
    await screen.findByText('Todavía no hay guía para este nivel')
}

describe('EmergencyGuidesTab', () => {
    beforeEach(() => {
        vi.resetAllMocks()
        getEmergencyGuide.mockImplementation((level) =>
            GUIDES[level] ? Promise.resolve({ data: GUIDES[level] }) : Promise.reject(notFound)
        )
    })

    it('loads one card per risk level and marks levels without a guide', async () => {
        await renderLoaded()

        expect(getEmergencyGuide).toHaveBeenCalledTimes(3)
        expect(within(card('TOXIC')).getByLabelText('Contactos de emergencia')).toHaveValue('Clinica 24h')
        expect(within(card('LETHAL')).getByLabelText('Qué hacer')).toHaveValue('')
        expect(within(card('LETHAL')).getByRole('button', { name: 'Crear guía' })).toBeDisabled()
        expect(within(card('TOXIC')).getByRole('button', { name: 'Guardar cambios' })).toBeDisabled()
    })

    it('saves the edited guide of a single level', async () => {
        saveEmergencyGuide.mockResolvedValue({
            data: { ...GUIDES.TOXIC, steps: 'Llama al veterinario de inmediato' },
        })
        const user = userEvent.setup()
        await renderLoaded()

        const toxic = card('TOXIC')
        await user.type(within(toxic).getByLabelText('Qué hacer'), ' de inmediato')
        await user.click(within(toxic).getByRole('button', { name: 'Guardar cambios' }))

        expect(saveEmergencyGuide).toHaveBeenCalledWith({
            riskLevel: 'TOXIC',
            steps: 'Llama al veterinario de inmediato',
            emergencyContactsInfo: 'Clinica 24h',
        })
        expect(await within(toxic).findByText('Guía guardada. Los dueños ya ven esta versión.')).toBeInTheDocument()
        expect(within(toxic).getByRole('button', { name: 'Guardar cambios' })).toBeDisabled()
    })

    it('creates the guide of a level that had none', async () => {
        saveEmergencyGuide.mockResolvedValue({
            data: { id: 3, riskLevel: 'LETHAL', steps: 'Ve a urgencias', emergencyContactsInfo: null },
        })
        const user = userEvent.setup()
        await renderLoaded()

        const lethal = card('LETHAL')
        await user.type(within(lethal).getByLabelText('Qué hacer'), 'Ve a urgencias')
        await user.click(within(lethal).getByRole('button', { name: 'Crear guía' }))

        expect(saveEmergencyGuide).toHaveBeenCalledWith({
            riskLevel: 'LETHAL',
            steps: 'Ve a urgencias',
            emergencyContactsInfo: null,
        })
        expect(await within(lethal).findByRole('button', { name: 'Guardar cambios' })).toBeInTheDocument()
        expect(within(lethal).queryByText('Todavía no hay guía para este nivel')).not.toBeInTheDocument()
    })

    it('does not save a guide without steps', async () => {
        const user = userEvent.setup()
        await renderLoaded()

        const moderate = card('MODERATE')
        await user.clear(within(moderate).getByLabelText('Qué hacer'))
        await user.click(within(moderate).getByRole('button', { name: 'Guardar cambios' }))

        expect(within(moderate).getByText('Escribe los pasos a seguir.')).toBeInTheDocument()
        expect(saveEmergencyGuide).not.toHaveBeenCalled()
    })

    it('shows a retry option when a guide fails to load for a reason other than not existing', async () => {
        getEmergencyGuide.mockImplementation((level) =>
            level === 'TOXIC'
                ? Promise.reject({ isAxiosError: true, response: { status: 500 } })
                : GUIDES[level]
                    ? Promise.resolve({ data: GUIDES[level] })
                    : Promise.reject(notFound)
        )
        const user = userEvent.setup()
        render(<EmergencyGuidesTab />)

        const toxic = card('TOXIC')
        expect(await within(toxic).findByText('No se pudo cargar la guía.')).toBeInTheDocument()

        getEmergencyGuide.mockResolvedValue({ data: GUIDES.TOXIC })
        await user.click(within(toxic).getByRole('button', { name: /reintentar/i }))

        expect(await within(toxic).findByDisplayValue('Llama al veterinario')).toBeInTheDocument()
    })
})