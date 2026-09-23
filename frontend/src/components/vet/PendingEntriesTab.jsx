import { useState } from 'react'
import { Check, ClipboardCheck, ExternalLink } from 'lucide-react'
import { getFoodSafetyByStatus, verifyFoodSafety } from '../../api/foods'
import { getSpeciesLabel } from '../../constants/species'
import { getLifeStageLabel } from '../../constants/lifeStages'
import { getApiErrorMessage } from '../../utils/apiError'
import { usePagination } from '../../hooks/usePagination'
import RiskBadge from '../RiskBadge'
import Spinner from '../Spinner'
import EmptyState from '../EmptyState'
import ErrorMessage from '../ErrorMessage'
import Pagination from '../Pagination'

const PAGE_SIZE = 10

const fetchPendingEntries = ({ page, size }) =>
    getFoodSafetyByStatus({ status: 'PENDING', page, size })

const isSafeUrl = (url) => /^https?:\/\//i.test(url ?? '')

function PendingEntriesTab({ canAct }) {
    const { items: entries, page, totalPages, loading, error, goToPage, reload } = usePagination(
        fetchPendingEntries,
        { size: PAGE_SIZE }
    )
    const [verifyingId, setVerifyingId] = useState(null)
    const [rowErrors, setRowErrors] = useState({})

    const handleVerify = async (id) => {
        setVerifyingId(id)
        setRowErrors((prev) => ({ ...prev, [id]: undefined }))
        try {
            await verifyFoodSafety(id)
            await reload()
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

    if (loading && entries.length === 0) {
        return <Spinner label="Cargando entradas pendientes..." />
    }

    if (error && entries.length === 0) {
        return (
            <ErrorMessage
                message={getApiErrorMessage(error, {
                    fallback: 'No se pudieron cargar las entradas pendientes.',
                })}
                onRetry={reload}
            />
        )
    }

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
        <div>
            {error && (
                <div className="mb-3">
                    <ErrorMessage
                        message={getApiErrorMessage(error, {
                            fallback: 'No se pudo actualizar la lista.',
                        })}
                        onRetry={reload}
                    />
                </div>
            )}

            <ul aria-busy={loading} className="space-y-3">
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

                                                  <a  href={source.sourceUrl}
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
                    disabled={!canAct || verifyingId !== null}
                    className="inline-flex items-center gap-2 min-h-[44px] px-4 bg-brand text-white text-sm font-medium rounded-md disabled:opacity-60"
                >
                    <Check size={16} aria-hidden="true" />
                    {verifyingId === entry.id ? 'Verificando...' : 'Verificar'}
                </button>
            </li>
            ))}
        </ul>

    <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} disabled={loading} />
</div>
)
}

export default PendingEntriesTab