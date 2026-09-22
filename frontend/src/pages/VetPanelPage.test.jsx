import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import VetPanelPage from './VetPanelPage'
import { useAuth } from '../context/AuthContext'
import { getFoodSafetyByStatus, verifyFoodSafety } from '../api/foods'
import { getAllFaqs } from '../api/faq'

// Factories keep the real API modules (and axiosClient) out of the tests
vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../api/foods', () => ({
    getFoodSafetyByStatus: vi.fn(),
    verifyFoodSafety: vi.fn(),
    getAllFoods: vi.fn(),
    createFoodSafety: vi.fn(),
}))
vi.mock('../api/faq', () => ({ getAllFaqs: vi.fn(), answerQuestion: vi.fn() }))

const PENDING_ENTRY = {
    id: 7,
    foodName: 'Uvas',
    species: 'DOG',
    lifeStage: null,
    riskLevel: 'TOXIC',
    notes: 'Riesgo de falla renal',
    sources: [
        { id: 1, sourceName: 'ASPCA', sourceUrl: 'https://www.aspca.org' },
        { id: 2, sourceName: 'Fuente sospechosa', sourceUrl: 'javascript:alert(1)' },
    ],
}

function mockVet({ verified }) {
    useAuth.mockReturnValue({
        user: { id: 3, role: 'VETERINARIAN', verified },
        refreshUser: vi.fn(),
    })
}

describe('VetPanelPage', () => {
    beforeEach(() => {
        vi.resetAllMocks()
        getFoodSafetyByStatus.mockResolvedValue({ data: [PENDING_ENTRY] })
        getAllFaqs.mockResolvedValue({ data: [] })
    })

    it('lists pending entries and removes one after verifying it', async () => {
        mockVet({ verified: true })
        verifyFoodSafety.mockResolvedValue({ data: {} })
        const user = userEvent.setup()

        render(<VetPanelPage />)

        expect(await screen.findByText('Uvas')).toBeInTheDocument()
        await user.click(screen.getByRole('button', { name: 'Verificar' }))

        expect(verifyFoodSafety).toHaveBeenCalledWith(7)
        await waitFor(() => expect(screen.queryByText('Uvas')).not.toBeInTheDocument())
        expect(screen.getByText('No hay entradas pendientes')).toBeInTheDocument()
    })

    it('only renders http(s) source URLs as links', async () => {
        mockVet({ verified: true })
        render(<VetPanelPage />)

        await screen.findByText('Uvas')
        expect(screen.getByRole('link', { name: /aspca/i })).toHaveAttribute('href', 'https://www.aspca.org')
        expect(screen.queryByRole('link', { name: /fuente sospechosa/i })).not.toBeInTheDocument()
        expect(screen.getByText('Fuente sospechosa')).toBeInTheDocument()
    })

    it('shows the approval notice and disables actions for unverified veterinarians', async () => {
        mockVet({ verified: false })
        render(<VetPanelPage />)

        expect(screen.getByText(/pendiente de aprobación/i)).toBeInTheDocument()
        expect(await screen.findByRole('button', { name: 'Verificar' })).toBeDisabled()
        expect(screen.getByRole('button', { name: /proponer entrada/i })).toBeDisabled()
    })

    it('shows an error with a retry option when loading fails', async () => {
        mockVet({ verified: true })
        getFoodSafetyByStatus
            .mockRejectedValueOnce({ response: { status: 500 } })
            .mockResolvedValueOnce({ data: [] })
        const user = userEvent.setup()

        render(<VetPanelPage />)

        expect(
            await screen.findByText('No se pudieron cargar las entradas pendientes.')
        ).toBeInTheDocument()
        await user.click(screen.getByRole('button', { name: /reintentar/i }))
        expect(await screen.findByText('No hay entradas pendientes')).toBeInTheDocument()
    })

    it('lists only unanswered questions, oldest first', async () => {
        mockVet({ verified: true })
        getAllFaqs.mockResolvedValue({
            data: [
                { id: 1, question: 'Pregunta nueva', status: 'PENDING', createdAt: '2026-09-20T10:00:00' },
                { id: 2, question: 'Ya respondida', status: 'ANSWERED', createdAt: '2026-09-19T10:00:00' },
                { id: 3, question: 'Pregunta antigua', status: 'PENDING', createdAt: '2026-09-01T10:00:00' },
            ],
        })
        const user = userEvent.setup()

        render(<VetPanelPage />)
        await user.click(screen.getByRole('tab', { name: /preguntas sin responder/i }))

        await screen.findByText('Pregunta antigua')
        expect(screen.queryByText('Ya respondida')).not.toBeInTheDocument()
        const items = screen.getAllByRole('listitem')
        expect(items[0]).toHaveTextContent('Pregunta antigua')
        expect(items[1]).toHaveTextContent('Pregunta nueva')
    })
})