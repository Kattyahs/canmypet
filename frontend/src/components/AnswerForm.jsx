import { useState } from 'react'
import { getApiErrorMessage } from '../utils/apiError'

/**
 * Inline answer form for a pending FAQ question.
 * `onSubmit(answer)` must return a promise; if it rejects, the error is shown here.
 */
function AnswerForm({ onSubmit, onCancel, disabled = false }) {
    const [text, setText] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!text.trim()) return
        setSubmitting(true)
        setError('')
        try {
            await onSubmit(text.trim())
        } catch (err) {
            setError(
                getApiErrorMessage(err, {
                    fallback: 'No se pudo enviar la respuesta.',
                    byStatus: {
                        403: 'Solo veterinarios con la cuenta aprobada pueden responder.',
                    },
                })
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-2">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                aria-label="Respuesta"
                placeholder="Escribe tu respuesta..."
                disabled={disabled || submitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand disabled:bg-gray-50"
            />
            {error && <p className="text-sm text-risk-toxic">{error}</p>}
            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={disabled || submitting || !text.trim()}
                    className="min-h-[44px] px-4 bg-brand text-white text-sm font-medium rounded-md disabled:opacity-60"
                >
                    {submitting ? 'Enviando...' : 'Enviar respuesta'}
                </button>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={submitting}
                        className="min-h-[44px] px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700"
                    >
                        Cancelar
                    </button>
                )}
            </div>
        </form>
    )
}

export default AnswerForm