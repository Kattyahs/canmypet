import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FaqPage from './FaqPage'
import { getFaqs, askQuestion, answerQuestion } from '../api/faq'
import { useAuth } from '../context/AuthContext'

vi.mock('../api/faq', () => ({ getFaqs: vi.fn(), askQuestion: vi.fn(), answerQuestion: vi.fn() }))
vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }))

const faqPage = (content) => ({ data: { content, page: 0, size: 10, totalElements: content.length, totalPages: 1 } })

const ANSWERED = {
    id: 1,
    question: '¿Pueden los perros comer plátano?',
    answer: 'Sí, con moderación.',
    status: 'ANSWERED',
    createdAt: '2026-09-20T10:00:00',
}
const PENDING = { id: 2, question: '¿Puedo darle palta a mi gato?', answer: null, status: 'PENDING', createdAt: '2026-09-21T10:00:00' }

describe('FaqPage', () => {
    beforeEach(() => {
        vi.resetAllMocks()
        useAuth.mockReturnValue({ user: { id: 9001, name: 'Kattya', role: 'OWNER' } })
        getFaqs.mockResolvedValue(faqPage([ANSWERED, PENDING]))
    })

    it('shows the answer only after opening the question', async () => {
        const user = userEvent.setup()
        render(<FaqPage />)

        const question = await screen.findByRole('button', { name: /pueden los perros comer plátano/i })
        expect(question).toHaveAttribute('aria-expanded', 'false')
        expect(screen.queryByText('Sí, con moderación.')).not.toBeInTheDocument()

        await user.click(question)

        expect(question).toHaveAttribute('aria-expanded', 'true')
        expect(screen.getByText('Sí, con moderación.')).toBeInTheDocument()
    })

    it('marks unanswered questions as pending', async () => {
        render(<FaqPage />)
        expect(await screen.findByRole('button', { name: /palta.*pendiente/i })).toBeInTheDocument()
    })

    it('asks the server for my questions only and starts from the first page', async () => {
        const user = userEvent.setup()
        render(<FaqPage />)

        await user.click(await screen.findByRole('tab', { name: 'Mis preguntas' }))

        await waitFor(() => expect(getFaqs).toHaveBeenLastCalledWith({ page: 0, size: 10, mine: true }))
    })

    it('sends a new question and explains it is pending', async () => {
        askQuestion.mockResolvedValue({ data: { ...PENDING, id: 3 } })
        const user = userEvent.setup()
        render(<FaqPage />)

        await user.type(await screen.findByLabelText('¿No encuentras la respuesta?'), '¿Mi conejo puede comer apio?')
        expect(screen.getByText('28/500')).toBeInTheDocument()
        await user.click(screen.getByRole('button', { name: 'Enviar pregunta' }))

        expect(askQuestion).toHaveBeenCalledWith({ question: '¿Mi conejo puede comer apio?' })
        expect(await screen.findByRole('status')).toHaveTextContent('Tu pregunta quedó pendiente.')
    })

    it('lets a verified veterinarian answer a pending question', async () => {
        useAuth.mockReturnValue({ user: { id: 9002, name: 'Vet', role: 'VETERINARIAN', verified: true } })
        answerQuestion.mockResolvedValue({ data: {} })
        const user = userEvent.setup()
        render(<FaqPage />)

        await user.click(await screen.findByRole('button', { name: /palta/i }))
        await user.click(screen.getByRole('button', { name: 'Responder esta pregunta' }))
        await user.type(screen.getByRole('textbox', { name: 'Respuesta' }), 'No, la palta es tóxica para gatos.')
        await user.click(screen.getByRole('button', { name: 'Enviar respuesta' }))

        expect(answerQuestion).toHaveBeenCalledWith(2, { answer: 'No, la palta es tóxica para gatos.' })
    })
})