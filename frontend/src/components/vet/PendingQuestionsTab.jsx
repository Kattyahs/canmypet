import { useCallback, useEffect, useState } from 'react'
import { HelpCircle } from 'lucide-react'
import { getAllFaqs, answerQuestion } from '../../api/faq'
import { getApiErrorMessage } from '../../utils/apiError'
import AnswerForm from '../AnswerForm'
import Spinner from '../Spinner'
import EmptyState from '../EmptyState'
import ErrorMessage from '../ErrorMessage'

const formatDate = (isoString) =>
    isoString
        ? new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short' }).format(new Date(isoString))
        : ''

function PendingQuestionsTab({ canAct }) {
    const [questions, setQuestions] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState('')
    const [answeringId, setAnsweringId] = useState(null)

    const load = useCallback(async () => {
        setLoading(true)
        setLoadError('')
        try {
            const res = await getAllFaqs()
            // Review queue: oldest unanswered question first
            const pending = res.data
                .filter((faq) => faq.status === 'PENDING')
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            setQuestions(pending)
        } catch (err) {
            setLoadError(getApiErrorMessage(err, { fallback: 'No se pudieron cargar las preguntas.' }))
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        load()
    }, [load])

    // Errors propagate to AnswerForm, which displays them
    const handleAnswer = async (id, answer) => {
        await answerQuestion(id, { answer })
        setAnsweringId(null)
        setQuestions((prev) => prev.filter((q) => q.id !== id))
    }

    if (loading) return <Spinner label="Cargando preguntas..." />
    if (loadError) return <ErrorMessage message={loadError} onRetry={load} />
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
        <ul className="space-y-3">
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
    )
}

export default PendingQuestionsTab