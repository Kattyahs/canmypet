import { useState, useEffect, useCallback } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Phone, ListChecks, FileQuestion, ArrowRight, AlertTriangle } from 'lucide-react'
import { getEmergencyGuide } from '../api/emergency'
import { RISK_CONFIG } from '../components/RiskBadge'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import ErrorMessage from '../components/ErrorMessage'
import { getApiErrorMessage } from '../utils/apiError'
import NearbyClinics from '../components/emergency/NearbyClinics'

const LEVELS = ['MODERATE', 'TOXIC', 'LETHAL']

function EmergencyPage() {
    const { riskLevel } = useParams()
    const navigate = useNavigate()
    const [selectedLevel, setSelectedLevel] = useState(LEVELS.includes(riskLevel) ? riskLevel : 'TOXIC')
    const [guide, setGuide] = useState(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)
    const [error, setError] = useState('')

    const load = useCallback(async () => {
        setLoading(true)
        setNotFound(false)
        setError('')
        setGuide(null)
        try {
            const res = await getEmergencyGuide(selectedLevel)
            setGuide(res.data)
        } catch (err) {
            if (err.response?.status === 404) {
                setNotFound(true)
            } else {
                setError(getApiErrorMessage(err, { fallback: 'No se pudo cargar la guía de emergencia.' }))
            }
        } finally {
            setLoading(false)
        }
    }, [selectedLevel])

    useEffect(() => {
        load()
    }, [load])

    const handleSelectLevel = (level) => {
        setSelectedLevel(level)
        navigate(`/emergency/${level}`, { replace: true })
    }

    const config = RISK_CONFIG[selectedLevel]

    return (
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Guías de emergencia</h1>
            <p className="text-sm text-gray-500 mb-6">
                Qué hacer si tu mascota ingirió algo peligroso.
            </p>
            <Link
                to="/emergency/start"
                className="group flex items-center gap-4 mb-6 p-4 md:p-5 rounded-2xl bg-risk-toxic text-white shadow-card hover:opacity-95"
            >
                <span className="shrink-0 w-11 h-11 rounded-full bg-white/15 flex items-center justify-center">
                    <AlertTriangle size={22} aria-hidden="true" />
                </span>
                <span className="flex-1">
                    <span className="block text-lg font-semibold">Mi mascota comió algo</span>
                    <span className="block text-sm text-white/90">Tres preguntas y te decimos qué hacer ahora.</span>
                </span>
                <ArrowRight size={20} className="shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>

            <p className="text-sm font-semibold text-gray-700 mb-2">Guías por nivel de riesgo</p>
            <div className="flex flex-wrap gap-2 mb-6">
                {LEVELS.map((level) => {
                    const levelConfig = RISK_CONFIG[level]
                    const isSelected = selectedLevel === level
                    return (
                        <button
                            key={level}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => handleSelectLevel(level)}
                            className={`flex items-center gap-2 min-h-[44px] px-4 rounded-full border text-sm font-semibold tracking-wide transition-colors ${
                                isSelected
                                    ? `${levelConfig.bg} ${levelConfig.border} ${levelConfig.text} font-medium`
                                    : 'border-gray-200 text-gray-600 bg-white hover:bg-bone'
                            }`}
                        >
                            <levelConfig.Icon size={14} aria-hidden="true" />
                            {levelConfig.label}
                        </button>
                    )
                })}
            </div>

            {loading && <Spinner label="Cargando guía..." />}

            {error && <ErrorMessage message={error} onRetry={load} />}

            {notFound && (
                <EmptyState
                    icon={FileQuestion}
                    title="Todavía no hay una guía para este nivel"
                    description="Mientras tanto, contacta a tu veterinario o a una clínica de urgencias."
                />
            )}

            {guide && (
                <div className="bg-white border border-gray-100 rounded-2xl shadow-card overflow-hidden">
                    <div className={`${config.bg} ${config.border} border-b p-5 md:p-6`}>
                        <div className="flex items-center gap-2">
                            <config.Icon size={24} className={config.text} aria-hidden="true" />
                            <h2 className={`text-xl font-bold tracking-wide ${config.text}`}>{config.label}</h2>
                        </div>
                        <p className={`text-sm mt-1 ${config.text}`}>{config.verdict}</p>
                    </div>

                    <div className="p-5 border-b border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                            <ListChecks size={16} className="text-gray-500" aria-hidden="true" />
                            <p className="text-sm font-semibold text-gray-700">
                                Qué hacer
                            </p>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-line">{guide.steps}</p>
                    </div>

                    {guide.emergencyContactsInfo && (
                        <div className="p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <Phone size={16} className="text-gray-500" aria-hidden="true" />
                                <p className="text-sm font-semibold text-gray-700">
                                    Contactos de emergencia
                                </p>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-line">
                                {guide.emergencyContactsInfo}
                            </p>
                        </div>
                    )}
                </div>
            )}
            <div className="mt-6">
                <NearbyClinics />
            </div>
            <p className="text-xs text-gray-400 mt-6 text-center">
                CanMyPet? ofrece orientación informativa y no sustituye una consulta veterinaria.
            </p>
        </div>
    )
}

export default EmergencyPage