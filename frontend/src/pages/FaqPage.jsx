import { useCallback, useId, useState } from 'react'
import { ChevronDown, CircleCheck, Clock, HelpCircle, Send } from 'lucide-react'
import { getFaqs, askQuestion, answerQuestion } from '../api/faq'
import { useAuth } from '../context/AuthContext'
import { usePagination } from '../hooks/usePagination'
import { getApiErrorMessage } from '../utils/apiError'
import AnswerForm from '../components/AnswerForm'
import Pagination from '../components/Pagination'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import ErrorMessage from '../components/ErrorMessage'
import SegmentedTabs from '../components/ui/SegmentedTabs'
import Button from '../components/ui/Button'

const PAGE_SIZE = 10
const MAX_QUESTION_LENGTH = 500

const TABS = [
    { value: 'all', label: 'Todas' },
    { value: 'mine', label: 'Mis preguntas' },
]

const formatDate = (isoString) =>
    isoString ? new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'long' }).format(new Date(isoString)) : ''

function StatusPill({ answered }) {
    return (
        <span
            className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                answered ? 'text-risk-safe bg-green-50' : 'text-risk-moderate bg-amber-50'
            }`}
        >
            {answered ? <CircleCheck size={12} aria-hidden="true" /> : <Clock size={12} aria-hidden="true" />}
            {answered ? 'Respondida' : 'Pendiente'}
        </span>
    )
}

function FaqItem({ faq, open, onToggle, canAnswer, answering, onStartAnswer, onCancelAnswer, onAnswer }) {
    const panelId = useId()
    const answered = faq.status === 'ANSWERED'

    return (
        <li className="bg-white border border-gray-100 rounded-2xl shadow-card overflow-hidden">
            <h2>
                <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={onToggle}
                    className="w-full flex items-center gap-3 min-h-[56px] px-4 md:px-5 py-3 text-left hover:bg-brand-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
                >
                    <span className="flex-1 min-w-0 text-sm md:text-base font-semibold text-gray-900">{faq.question}</span>
                    <StatusPill answered={answered} />
                    <ChevronDown
                        size={18}
                        aria-hidden="true"
                        className={`shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
                    />
                </button>
            </h2>
            {open && (
                <div id={panelId} className="px-4 md:px-5 pb-4 flex flex-col gap-3">
                    {answered ? (
                        <div className="rounded-xl bg-brand-muted px-4 py-3">
                            <p className="text-xs font-semibold text-brand mb-1">Respuesta del veterinario</p>
                            <p className="text-sm leading-relaxed text-gray-700">{faq.answer}</p>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">Un veterinario verificado todavía no responde esta pregunta.</p>
                    )}
                    <p className="text-xs text-gray-400">Preguntada el {formatDate(faq.createdAt)}</p>

                    {canAnswer && !answered && (
                        <div>
                            {answering ? (
                                <AnswerForm onSubmit={onAnswer} onCancel={onCancelAnswer} />
                            ) : (
                                <button
                                    type="button"
                                    onClick={onStartAnswer}
                                    className="min-h-[44px] text-sm font-medium text-brand"
                                >
                                    Responder esta pregunta
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </li>
    )
}

function FaqPage() {
    const { user } = useAuth()
    const [tab, setTab] = useState('all')
    const fetchFaqs = useCallback(
        ({ page, size }) => getFaqs({ page, size, ...(tab === 'mine' ? { mine: true } : {}) }),
        [tab]
    )
    const { items: faqs, page, totalPages, loading, error: loadError, goToPage, reload } = usePagination(fetchFaqs, {
        size: PAGE_SIZE,
    })
    const [openIds, setOpenIds] = useState(() => new Set())
    const [newQuestion, setNewQuestion] = useState('')
    const [asking, setAsking] = useState(false)
    const [askError, setAskError] = useState('')
    const [asked, setAsked] = useState(false)
    const [answeringId, setAnsweringId] = useState(null)

    const canAnswer = user?.role === 'VETERINARIAN' && user?.verified === true

    const changeTab = (value) => {
        setTab(value)
        goToPage(0)
    }

    const toggle = (id) =>
        setOpenIds((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })

    const handleAsk = async (e) => {
        e.preventDefault()
        if (!newQuestion.trim()) return
        setAsking(true)
        setAskError('')
        setAsked(false)
        try {
            await askQuestion({ question: newQuestion.trim() })
            setNewQuestion('')
            setAsked(true)
            if (page === 0) reload()
            else goToPage(0)
        } catch (err) {
            setAskError(getApiErrorMessage(err, { fallback: 'No se pudo enviar la pregunta.' }))
        } finally {
            setAsking(false)
        }
    }

    const handleAnswer = async (faqId, answer) => {
        await answerQuestion(faqId, { answer })
        setAnsweringId(null)
        reload()
    }

    const initialLoading = loading && faqs.length === 0

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Preguntas frecuentes</h1>
                <p className="text-sm text-gray-500 mt-1">Respuestas de veterinarios verificados a tus dudas sobre alimentación.</p>
            </div>

            <SegmentedTabs options={TABS} value={tab} onChange={changeTab} label="Qué preguntas ver" className="sm:max-w-sm" />

            {initialLoading && <Spinner label="Cargando preguntas..." />}

            {loadError && (
                <ErrorMessage
                    message={getApiErrorMessage(loadError, { fallback: 'No se pudieron cargar las preguntas.' })}
                    onRetry={reload}
                />
            )}

            {!loading && !loadError && faqs.length === 0 && (
                <EmptyState
                    icon={HelpCircle}
                    title={tab === 'mine' ? 'Todavía no has hecho preguntas' : 'Todavía no hay preguntas registradas'}
                    description="Escribe tu pregunta en el formulario de abajo."
                />
            )}

            {faqs.length > 0 && (
                <ul aria-busy={loading} className="flex flex-col gap-3">
                    {faqs.map((faq) => (
                        <FaqItem
                            key={faq.id}
                            faq={faq}
                            open={openIds.has(faq.id)}
                            onToggle={() => toggle(faq.id)}
                            canAnswer={canAnswer}
                            answering={answeringId === faq.id}
                            onStartAnswer={() => setAnsweringId(faq.id)}
                            onCancelAnswer={() => setAnsweringId(null)}
                            onAnswer={(answer) => handleAnswer(faq.id, answer)}
                        />
                    ))}
                </ul>
            )}

            <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} disabled={loading} />

            <form onSubmit={handleAsk} className="flex flex-col gap-3 p-4 md:p-5 rounded-2xl bg-brand-muted border border-brand-soft">
                <div>
                    <label htmlFor="faq-question" className="block text-base font-semibold text-gray-900">
                        ¿No encuentras la respuesta?
                    </label>
                    <p className="text-sm text-gray-600">Envíanos tu pregunta y un veterinario verificado la responderá.</p>
                </div>
                <div className="relative">
                    <textarea
                        id="faq-question"
                        rows={3}
                        value={newQuestion}
                        maxLength={MAX_QUESTION_LENGTH}
                        onChange={(e) => {
                            setNewQuestion(e.target.value)
                            setAsked(false)
                        }}
                        placeholder="¿Puedo darle zanahoria cruda a mi conejo?"
                        aria-describedby="faq-question-count"
                        className="w-full px-4 py-3 pb-7 border border-gray-200 rounded-xl text-base md:text-sm bg-white resize-none focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                    />
                    <span id="faq-question-count" className="absolute right-3 bottom-3 text-xs text-gray-400">
                        {newQuestion.length}/{MAX_QUESTION_LENGTH}
                    </span>
                </div>
                {askError && (
                    <p role="alert" className="text-sm text-risk-toxic">
                        {askError}
                    </p>
                )}
                {asked && (
                    <p role="status" className="flex items-start gap-2 text-sm text-gray-700">
                        <Clock size={16} className="shrink-0 mt-0.5 text-risk-moderate" aria-hidden="true" />
                        Tu pregunta quedó pendiente. La verás en "Mis preguntas" hasta que un veterinario la responda.
                    </p>
                )}
                <Button type="submit" disabled={asking || !newQuestion.trim()} fullWidth>
                    <Send size={16} aria-hidden="true" />
                    {asking ? 'Enviando...' : 'Enviar pregunta'}
                </Button>
            </form>
        </div>
    )
}

export default FaqPage