import { useState } from 'react'
import { HelpCircle } from 'lucide-react'
import { getFaqs, answerQuestion } from '../../api/faq'
import { getApiErrorMessage } from '../../utils/apiError'
import { usePagination } from '../../hooks/usePagination'
import AnswerForm from '../AnswerForm'
import Spinner from '../Spinner'
import EmptyState from '../EmptyState'
import ErrorMessage from '../ErrorMessage'
import Pagination from '../Pagination'

const PAGE_SIZE = 10

const fetchPendingQuestions = ({ page, size }) =>
    getFaqs({ status: 'PENDING', sort: 'createdAt,asc', page, size })

const formatDate = (isoString) =>
    isoString
        ? new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short' }).format(new Date(isoString))
        : ''

function PendingQuestionsTab({ canAct }) {
    const { items: questions, page, totalPages, loading, error, goToPage, reload } = usePagination(
        fetchPendingQuestions,
        { size: PAGE_SIZE }
    )
    const [answeringId, setAnsweringId] = useState(null)

    const handleAnswer = async (id, answer) => {
        await answerQuestion(id, { answer })
        setAnsweringId(null)
        await reload()
    }

    if (loading && questions.length === 0) {
        return <Spinner label="Cargando preguntas..." />
    }

    if (error && questions.length === 0) {
        return (
            <ErrorMessage
                message={getApiErrorMessage(error, { fallback: 'No se pudieron cargar las preguntas.' })}
                onRetry={reload}
            />
        )
    }

    if (questions.length === 0) {
        return (
            <EmptyState
                icon={HelpCircle}
                title="No hay preguntas sin responder"
                description="Cuando alguien haga una pregunta, aparecerá aquí."
            />
        )
    }

    return (
        <div>
            {error && (
                <div className="mb-3">
                    <ErrorMessage
                        message={getApiErrorMessage(error, { fallback: 'No se pudo actualizar la lista.' })}
                        onRetry={reload}
                    />
                </div>
            )}

            <ul aria-busy={loading} className="space-y-3">
                {questions.map((faq) => (
                    <li key={faq.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <p className="font-medium text-gray-900">{faq.question}</p>
                        <p className="font-mono text-xs text-gray-400 mt-1 mb-3">{formatDate(faq.createdAt)}</p>

                        {answeringId === faq.id ? (
                            <AnswerForm
                                onSubmit={(answer) => handleAnswer(faq.id, answer)}
                                onCancel={() => setAnsweringId(null)}
                                disabled={!canAct}
                            />
                        ) : (
                            <button
                                type="button"
                                onClick={() => setAnsweringId(faq.id)}
                                disabled={!canAct}
                                className="min-h-[44px] text-sm text-brand font-medium disabled:opacity-50"
                            >
                                Responder esta pregunta
                            </button>
                        )}
                    </li>
                ))}
            </ul>

            <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} disabled={loading} />
        </div>
    )
}

export default PendingQuestionsTab