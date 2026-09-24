import { useEffect, useState } from 'react'
import { getEmergencyGuide, saveEmergencyGuide } from '../../api/emergency'
import { getApiErrorMessage } from '../../utils/apiError'
import { RISK_CONFIG } from '../RiskBadge'
import Spinner from '../Spinner'
import ErrorMessage from '../ErrorMessage'

const LABEL = 'block font-mono text-xs uppercase tracking-wide text-gray-500 mb-1.5'
const TEXTAREA =
    'w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand'

const EMPTY_GUIDE = { steps: '', emergencyContactsInfo: '' }

const toForm = (guide) => ({
    steps: guide?.steps ?? '',
    emergencyContactsInfo: guide?.emergencyContactsInfo ?? '',
})

function EmergencyGuideCard({ level }) {
    const config = RISK_CONFIG[level]
    const [saved, setSaved] = useState(EMPTY_GUIDE)
    const [form, setForm] = useState(EMPTY_GUIDE)
    const [exists, setExists] = useState(false)
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState(null)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [notice, setNotice] = useState('')
    const [attempt, setAttempt] = useState(0)

    useEffect(() => {
        let active = true
        getEmergencyGuide(level)
            .then((res) => {
                if (!active) return
                setSaved(toForm(res.data))
                setForm(toForm(res.data))
                setExists(true)
            })
            .catch((err) => {
                if (!active) return
                if (err?.response?.status === 404) {
                    setSaved(EMPTY_GUIDE)
                    setForm(EMPTY_GUIDE)
                    setExists(false)
                } else {
                    setLoadError(err)
                }
            })
            .finally(() => {
                if (active) setLoading(false)
            })
        return () => {
            active = false
        }
    }, [level, attempt])

    const retry = () => {
        setLoading(true)
        setLoadError(null)
        setAttempt((n) => n + 1)
    }

    const setField = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }))
        setError('')
        setNotice('')
    }

    const isDirty =
        form.steps !== saved.steps || form.emergencyContactsInfo !== saved.emergencyContactsInfo

    const handleSubmit = async (e) => {
        e.preventDefault()
        const payload = {
            riskLevel: level,
            steps: form.steps.trim(),
            emergencyContactsInfo: form.emergencyContactsInfo.trim() || null,
        }
        if (!payload.steps) {
            setError('Escribe los pasos a seguir.')
            return
        }

        setSaving(true)
        setError('')
        setNotice('')
        try {
            const res = await saveEmergencyGuide(payload)
            setSaved(toForm(res.data))
            setForm(toForm(res.data))
            setExists(true)
            setNotice('Guía guardada. Los dueños ya ven esta versión.')
        } catch (err) {
            setError(
                getApiErrorMessage(err, {
                    fallback: 'No se pudo guardar la guía.',
                    byStatus: { 403: 'Solo un administrador puede editar las guías.' },
                })
            )
        } finally {
            setSaving(false)
        }
    }

    const headingId = `guide-${level}-title`

    return (
        <section aria-labelledby={headingId} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className={`${config.bg} ${config.border} border-b px-4 py-3 flex flex-wrap items-center justify-between gap-2`}>
                <h2 id={headingId} className={`flex items-center gap-2 font-mono text-sm font-medium uppercase ${config.text}`}>
                    <config.Icon size={16} aria-hidden="true" />
                    {level}
                </h2>
                {!loading && !loadError && !exists && (
                    <span className="text-xs text-gray-600">Todavía no hay guía para este nivel</span>
                )}
            </div>

            <div className="p-4">
                {loading ? (
                    <Spinner label={`Cargando guía ${level}...`} />
                ) : loadError ? (
                    <ErrorMessage
                        message={getApiErrorMessage(loadError, { fallback: 'No se pudo cargar la guía.' })}
                        onRetry={retry}
                    />
                ) : (
                    <form onSubmit={handleSubmit} noValidate className="space-y-4">
                        <div>
                            <label htmlFor={`guide-${level}-steps`} className={LABEL}>
                                Qué hacer
                            </label>
                            <textarea
                                id={`guide-${level}-steps`}
                                value={form.steps}
                                onChange={setField('steps')}
                                rows={6}
                                placeholder="Un paso por línea"
                                className={TEXTAREA}
                            />
                        </div>

                        <div>
                            <label htmlFor={`guide-${level}-contacts`} className={LABEL}>
                                Contactos de emergencia
                            </label>
                            <textarea
                                id={`guide-${level}-contacts`}
                                value={form.emergencyContactsInfo}
                                onChange={setField('emergencyContactsInfo')}
                                rows={3}
                                className={TEXTAREA}
                            />
                        </div>

                        {error && (
                            <p role="alert" className="text-sm text-risk-toxic">
                                {error}
                            </p>
                        )}
                        {notice && (
                            <p role="status" className="text-sm text-gray-900 bg-green-50 border border-green-100 rounded-md p-2">
                                {notice}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={saving || !isDirty}
                            className="min-h-[44px] px-4 bg-brand text-white text-sm font-medium rounded-md disabled:opacity-60"
                        >
                            {saving ? 'Guardando...' : exists ? 'Guardar cambios' : 'Crear guía'}
                        </button>
                    </form>
                )}
            </div>
        </section>
    )
}

export default EmergencyGuideCard