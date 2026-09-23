import { useState } from 'react'
import { MessageCirclePlus, CircleCheck, Clock, HelpCircle } from 'lucide-react'
import { getFaqs, askQuestion, answerQuestion } from '../api/faq'
import { useAuth } from '../context/AuthContext'
import { usePagination } from '../hooks/usePagination'
import { getApiErrorMessage } from '../utils/apiError'
import AnswerForm from '../components/AnswerForm'
import Pagination from '../components/Pagination'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import ErrorMessage from '../components/ErrorMessage'

const PAGE_SIZE = 10

const fetchFaqs = ({ page, size }) => getFaqs({ page, size })

const formatDate = (isoString) => {
    if (!isoString) return ''
    return new Intl.DateTimeFormat('es-CL', {
        day: 'numeric',
        month: 'short',
    }).format(new Date(isoString))
}

function FaqPage() {
    const { user } = useAuth()
    const {
        items: faqs,
        page,
        totalPages,
        loading,
        error: loadError,
        goToPage,
        reload,
    } = usePagination(fetchFaqs, { size: PAGE_SIZE })
    const [newQuestion, setNewQuestion] = useState('')
    const [asking, setAsking] = useState(false)
    const [askError, setAskError] = useState('')
    const [answeringId, setAnsweringId] = useState(null)

    // UX only: the backend rejects answers from unverified veterinarians anyway
    const canAnswer = user?.role === 'VETERINARIAN' && user?.verified === true

    const handleAsk = async (e) => {
        e.preventDefault()
        if (!newQuestion.trim()) return
        setAsking(true)
        setAskError('')
        try {
            await askQuestion({ question: newQuestion.trim() })
            setNewQuestion('')
            // Newest first: the new question lands on the first page
            if (page === 0) reload()
            else goToPage(0)
        } catch (err) {
            setAskError(getApiErrorMessage(err, { fallback: 'No se pudo enviar la pregunta.' }))
        } finally {
            setAsking(false)
        }
    }

    // Errors propagate to AnswerForm, which displays them
    const handleAnswer = async (faqId, answer) => {
        await answerQuestion(faqId, { answer })
        setAnsweringId(null)
        reload()
    }

    const initialLoading = loading && faqs.length === 0

    return (
        <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Preguntas frecuentes</h1>
            <p className="text-sm text-gray-500 mb-6">
                Consultas respondidas por veterinarios verificados.
            </p>

            {/* Formulario de pregunta */}
            <form onSubmit={handleAsk} className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                <label
                    htmlFor="faq-question"
                    className="block font-mono text-xs uppercase tracking-wide text-gray-500 mb-2"
                >
                    Haz una pregunta
                </label>
                <div className="flex flex-col md:flex-row gap-3">
                    <input
                        id="faq-question"
                        type="text"
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder="¿Puedo darle zanahoria cruda a mi conejo?"
                        className="flex-1 min-h-[44px] px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                    <button
                        type="submit"
                        disabled={asking || !newQuestion.trim()}
                        className="flex items-center justify-center gap-2 min-h-[44px] px-4 bg-brand text-white text-sm font-medium rounded-md disabled:opacity-60"
                    >
                        <MessageCirclePlus size={16} aria-hidden="true" />
                        {asking ? 'Enviando...' : 'Preguntar'}
                    </button>
                </div>
                {askError && <p className="text-sm text-risk-toxic mt-3">{askError}</p>}
            </form>

            {initialLoading && <Spinner label="Cargando preguntas..." />}

            {loadError && (
                <ErrorMessage
                    message={getApiErrorMessage(loadError, {
                        fallback: 'No se pudieron cargar las preguntas.',
                    })}
                    onRetry={reload}
                />
            )}

            {!loading && !loadError && faqs.length === 0 && (
                <EmptyState
                    icon={HelpCircle}
                    title="Todavía no hay preguntas registradas"
                    description="Haz la primera pregunta con el formulario de arriba."
                />
            )}

            {faqs.length > 0 && (
                <div aria-busy={loading} className="space-y-3">
                    {faqs.map((faq) => (
                        <div key={faq.id} className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between gap-4 mb-2">
                                <p className="font-medium text-gray-900">{faq.question}</p>
                                <span
                                    className={`shrink-0 inline-flex items-center gap-1 font-mono text-xs uppercase px-1.5 py-0.5 rounded ${
                                        faq.status === 'ANSWERED'
                                            ? 'text-risk-safe bg-green-50'
                                            : 'text-gray-500 bg-gray-100'
                                    }`}
                                >
                                    {faq.status === 'ANSWERED' ? (
                                        <CircleCheck size={12} aria-hidden="true" />
                                    ) : (
                                        <Clock size={12} aria-hidden="true" />
                                    )}
                                    {faq.status === 'ANSWERED' ? 'Respondida' : 'Pendiente'}
                                </span>
                            </div>

                            <p className="font-mono text-xs text-gray-400 mb-3">{formatDate(faq.createdAt)}</p>

                            {faq.answer && (
                                <div className="bg-bone rounded-md p-3 mb-2">
                                    <p className="font-mono text-xs uppercase tracking-wide text-brand mb-1">
                                        Respuesta del veterinario
                                    </p>
                                    <p className="text-sm text-gray-700">{faq.answer}</p>
                                </div>
                            )}

                            {/* Solo veterinarios aprobados pueden responder pendientes */}
                            {canAnswer && faq.status === 'PENDING' && (
                                <div className="pt-2">
                                    {answeringId === faq.id ? (
                                        <AnswerForm
                                            onSubmit={(answer) => handleAnswer(faq.id, answer)}
                                            onCancel={() => setAnsweringId(null)}
                                        />
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setAnsweringId(faq.id)}
                                            className="min-h-[44px] text-sm text-brand font-medium"
                                        >
                                            Responder esta pregunta
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} disabled={loading} />
        </div>
    )
}

export default FaqPage