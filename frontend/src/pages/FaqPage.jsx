import { useState, useEffect } from 'react'
import { MessageCirclePlus, CircleCheck, Clock } from 'lucide-react'
import { getAllFaqs, askQuestion, answerQuestion } from '../api/faq'
import { useAuth } from '../context/AuthContext'
import AnswerForm from '../components/AnswerForm'

function FaqPage() {
    const { user } = useAuth()
    const [faqs, setFaqs] = useState([])
    const [loading, setLoading] = useState(true)
    const [newQuestion, setNewQuestion] = useState('')
    const [asking, setAsking] = useState(false)
    const [answeringId, setAnsweringId] = useState(null)
    const [error, setError] = useState('')

    const isVet = user?.role === 'VETERINARIAN'

    const loadFaqs = async () => {
        setLoading(true)
        try {
            const res = await getAllFaqs()
            setFaqs(res.data)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadFaqs()
    }, [])

    const handleAsk = async (e) => {
        e.preventDefault()
        if (!newQuestion.trim()) return
        setAsking(true)
        setError('')
        try {
            await askQuestion({ question: newQuestion })
            setNewQuestion('')
            await loadFaqs()
        } catch {
            setError('No se pudo enviar la pregunta.')
        } finally {
            setAsking(false)
        }
    }

    const handleAnswer = async (faqId, answer) => {
        await answerQuestion(faqId, { answer })
        setAnsweringId(null)
        await loadFaqs()
    }

    const formatDate = (isoString) => {
        if (!isoString) return ''
        return new Intl.DateTimeFormat('es-CL', {
            day: 'numeric',
            month: 'short',
        }).format(new Date(isoString))
    }

    return (
        <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Preguntas frecuentes</h1>
            <p className="text-sm text-gray-500 mb-6">
                Consultas respondidas por veterinarios verificados.
            </p>

            {/* Formulario de pregunta */}
            <form
                onSubmit={handleAsk}
                className="bg-white border border-gray-200 rounded-lg p-4 mb-6"
            >
                <label className="block font-mono text-xs uppercase tracking-wide text-gray-500 mb-2">
                    Haz una pregunta
                </label>
                <div className="flex flex-col md:flex-row gap-3">
                    <input
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
                        <MessageCirclePlus size={16} />
                        {asking ? 'Enviando...' : 'Preguntar'}
                    </button>
                </div>
                {error && <p className="text-sm text-risk-toxic mt-3">{error}</p>}
            </form>

            {loading && <p className="text-sm text-gray-400">Cargando...</p>}

            {!loading && faqs.length === 0 && (
                <p className="text-sm text-gray-400">Todavía no hay preguntas registradas.</p>
            )}

            <div className="space-y-3">
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
                {faq.status === 'ANSWERED' ? <CircleCheck size={12} /> : <Clock size={12} />}
                                {faq.status === 'ANSWERED' ? 'Respondida' : 'Pendiente'}
              </span>
                        </div>

                        <p className="font-mono text-xs text-gray-400 mb-3">
                            {formatDate(faq.createdAt)}
                        </p>

                        {faq.answer && (
                            <div className="bg-bone rounded-md p-3 mb-2">
                                <p className="font-mono text-xs uppercase tracking-wide text-brand mb-1">
                                    Respuesta del veterinario
                                </p>
                                <p className="text-sm text-gray-700">{faq.answer}</p>
                            </div>
                        )}

                        {/* Solo veterinarios pueden responder pendientes */}
                        {isVet && faq.status === 'PENDING' && (
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
                                        className="text-sm text-brand font-medium"
                                    >
                                        Responder esta pregunta
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default FaqPage