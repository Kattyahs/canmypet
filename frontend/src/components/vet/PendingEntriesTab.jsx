import { useCallback, useEffect, useState } from 'react'
import { Check, ClipboardCheck, ExternalLink } from 'lucide-react'
import { getFoodSafetyByStatus, verifyFoodSafety } from '../../api/foods'
import { getSpeciesLabel } from '../../constants/species'
import { getLifeStageLabel } from '../../constants/lifeStages'
import { getApiErrorMessage } from '../../utils/apiError'
import RiskBadge from '../RiskBadge'
import Spinner from '../Spinner'
import EmptyState from '../EmptyState'
import ErrorMessage from '../ErrorMessage'

// Source URLs are user-entered: only render http(s) links, never javascript: or data:
const isSafeUrl = (url) => /^https?:\/\//i.test(url ?? '')

function PendingEntriesTab({ canAct }) {
    const [entries, setEntries] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState('')
    const [verifyingId, setVerifyingId] = useState(null)
    const [rowErrors, setRowErrors] = useState({})

    const load = useCallback(async () => {
        setLoading(true)
        setLoadError('')
        try {
            const res = await getFoodSafetyByStatus('PENDING')
            setEntries(res.data)
        } catch (err) {
            setLoadError(
                getApiErrorMessage(err, { fallback: 'No se pudieron cargar las entradas pendientes.' })
            )
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        load()
    }, [load])

    const handleVerify = async (id) => {
        setVerifyingId(id)
        setRowErrors((prev) => ({ ...prev, [id]: undefined }))
        try {
            await verifyFoodSafety(id)
            setEntries((prev) => prev.filter((entry) => entry.id !== id))
        } catch (err) {
            setRowErrors((prev) => ({
                ...prev,
                [id]: getApiErrorMessage(err, {
                    fallback: 'No se pudo verificar la entrada.',
                    byStatus: {
                        403: 'Solo veterinarios con la cuenta aprobada pueden verificar entradas.',
                        404: 'Esta entrada ya no existe. Recarga la lista.',
                    },
                }),
            }))
        } finally {
            setVerifyingId(null)
        }
    }

    if (loading) return <Spinner label="Cargando entradas pendientes..." />
    if (loadError) return <ErrorMessage message={loadError} onRetry={load} />
    if (entries.length === 0) {
        return (
            <EmptyState
                icon={ClipboardCheck}
                title="No hay entradas pendientes"
                description="Todas las evaluaciones de riesgo están verificadas."
            />
        )
    }

    return (
        <ul className="space-y-3">
            {entries.map((entry) => (
                <li key={entry.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                        <div>
                            <p className="font-medium text-gray-900">{entry.foodName}</p>
                            <p className="text-sm text-gray-500">
                                {getSpeciesLabel(entry.species)} · {getLifeStageLabel(entry.lifeStage)}
                            </p>
                        </div>
                        <RiskBadge level={entry.riskLevel} size="md" />
                    </div>

                    {entry.notes && <p className="text-sm text-gray-700 mb-3">{entry.notes}</p>}

                    {entry.sources?.length > 0 && (
                        <div className="mb-3">
                            <p className="font-mono text-xs uppercase tracking-wide text-gray-500 mb-1">
                                Fuentes
                            </p>
                            <ul className="space-y-1">
                                {entry.sources.map((source) => (
                                    <li key={source.id} className="text-sm">
                                        {isSafeUrl(source.sourceUrl) ? (

                                               <a href={source.sourceUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-brand"
                                            >
                                        {source.sourceName}
                                            <ExternalLink size={12} aria-hidden="true" />
                                    </a>
                                    ) : (
                                    <span className="text-gray-700">{source.sourceName}</span>
                            )}
                        </li>
                        ))}
                </ul>
                </div>
                )}

            {rowErrors[entry.id] && (
                <p className="text-sm text-risk-toxic mb-2">{rowErrors[entry.id]}</p>
            )}

            <button
                type="button"
                onClick={() => handleVerify(entry.id)}
                disabled={!canAct || verifyingId === entry.id}
                className="inline-flex items-center gap-2 min-h-[44px] px-4 bg-brand text-white text-sm font-medium rounded-md disabled:opacity-60"
            >
                <Check size={16} aria-hidden="true" />
                {verifyingId === entry.id ? 'Verificando...' : 'Verificar'}
            </button>
        </li>
    ))}
</ul>
)
}

export default PendingEntriesTab