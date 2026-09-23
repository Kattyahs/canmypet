import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import VetPanelPage from './VetPanelPage'
import { useAuth } from '../context/AuthContext'
import { getFoodSafetyByStatus, verifyFoodSafety } from '../api/foods'
import { getFaqs } from '../api/faq'

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../api/foods', () => ({
    getFoodSafetyByStatus: vi.fn(),
    verifyFoodSafety: vi.fn(),
    searchFoods: vi.fn(),
    createFoodSafety: vi.fn(),
}))
vi.mock('../api/faq', () => ({ getFaqs: vi.fn(), answerQuestion: vi.fn() }))

const pageOf = (content, page = 0, totalPages = 1) => ({
    content,
    page,
    size: 10,
    totalElements: content.length,
    totalPages,
})

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
        getFoodSafetyByStatus.mockResolvedValue({ data: pageOf([PENDING_ENTRY]) })
        getFaqs.mockResolvedValue({ data: pageOf([]) })
    })

    it('requests the first page of pending entries', async () => {
        mockVet({ verified: true })
        render(<VetPanelPage />)

        await screen.findByText('Uvas')
        expect(getFoodSafetyByStatus).toHaveBeenCalledWith({ status: 'PENDING', page: 0, size: 10 })
    })

    it('reloads the list after verifying an entry', async () => {
        mockVet({ verified: true })
        getFoodSafetyByStatus
            .mockResolvedValueOnce({ data: pageOf([PENDING_ENTRY]) })
            .mockResolvedValueOnce({ data: pageOf([]) })
        verifyFoodSafety.mockResolvedValue({ data: {} })
        const user = userEvent.setup()

        render(<VetPanelPage />)

        await screen.findByText('Uvas')
        await user.click(screen.getByRole('button', { name: 'Verificar' }))

        expect(verifyFoodSafety).toHaveBeenCalledWith(7)
        expect(await screen.findByText('No hay entradas pendientes')).toBeInTheDocument()
        expect(getFoodSafetyByStatus).toHaveBeenCalledTimes(2)
    })

    it('navigates to the next page of pending entries', async () => {
        mockVet({ verified: true })
        getFoodSafetyByStatus
            .mockResolvedValueOnce({ data: pageOf([PENDING_ENTRY], 0, 2) })
            .mockResolvedValueOnce({
                data: pageOf([{ ...PENDING_ENTRY, id: 8, foodName: 'Cebolla' }], 1, 2),
            })
        const user = userEvent.setup()

        render(<VetPanelPage />)

        await screen.findByText('Uvas')
        await user.click(screen.getByRole('button', { name: /siguiente/i }))

        expect(await screen.findByText('Cebolla')).toBeInTheDocument()
        expect(getFoodSafetyByStatus).toHaveBeenLastCalledWith({ status: 'PENDING', page: 1, size: 10 })
        expect(screen.getByText('Página 2 de 2')).toBeInTheDocument()
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
            .mockResolvedValueOnce({ data: pageOf([]) })
        const user = userEvent.setup()

        render(<VetPanelPage />)

        expect(
            await screen.findByText('No se pudieron cargar las entradas pendientes.')
        ).toBeInTheDocument()
        await user.click(screen.getByRole('button', { name: /reintentar/i }))
        expect(await screen.findByText('No hay entradas pendientes')).toBeInTheDocument()
    })

    it('asks the server for unanswered questions, oldest first', async () => {
        mockVet({ verified: true })
        getFaqs.mockResolvedValue({
            data: pageOf([
                { id: 3, question: 'Pregunta antigua', status: 'PENDING', createdAt: '2026-09-01T10:00:00' },
            ]),
        })
        const user = userEvent.setup()

        render(<VetPanelPage />)
        await user.click(screen.getByRole('tab', { name: /preguntas sin responder/i }))

        expect(await screen.findByText('Pregunta antigua')).toBeInTheDocument()
        expect(getFaqs).toHaveBeenCalledWith({
            status: 'PENDING',
            sort: 'createdAt,asc',
            page: 0,
            size: 10,
        })
    })
})