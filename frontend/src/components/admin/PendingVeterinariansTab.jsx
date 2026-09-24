import { useState } from 'react'
import { Check, UserCheck } from 'lucide-react'
import { getUsers, verifyUser } from '../../api/users'
import { getApiErrorMessage } from '../../utils/apiError'
import { usePagination } from '../../hooks/usePagination'
import Spinner from '../Spinner'
import EmptyState from '../EmptyState'
import ErrorMessage from '../ErrorMessage'
import Pagination from '../Pagination'

const PAGE_SIZE = 10

const fetchPendingVeterinarians = ({ page, size }) =>
    getUsers({ role: 'VETERINARIAN', verified: false, sort: 'createdAt,asc', page, size })

const formatDate = (isoString) =>
    isoString
        ? new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short', year: 'numeric' }).format(
            new Date(isoString)
        )
        : 'Sin fecha'

function PendingVeterinariansTab() {
    const { items: veterinarians, page, totalPages, loading, error, goToPage, reload } = usePagination(
        fetchPendingVeterinarians,
        { size: PAGE_SIZE }
    )
    const [approvingId, setApprovingId] = useState(null)
    const [rowErrors, setRowErrors] = useState({})
    const [notice, setNotice] = useState('')

    const handleApprove = async (vet) => {
        setApprovingId(vet.id)
        setNotice('')
        setRowErrors((prev) => ({ ...prev, [vet.id]: undefined }))
        try {
            await verifyUser(vet.id)
            setNotice(`${vet.name} ya puede usar el panel veterinario.`)
            await reload()
        } catch (err) {
            setRowErrors((prev) => ({
                ...prev,
                [vet.id]: getApiErrorMessage(err, {
                    fallback: 'No se pudo aprobar la cuenta.',
                    byStatus: {
                        403: 'Solo un administrador puede aprobar veterinarios.',
                        404: 'Esta cuenta ya no existe. Recarga la lista.',
                        409: 'Esta cuenta no es de un veterinario.',
                    },
                }),
            }))
        } finally {
            setApprovingId(null)
        }
    }

    if (loading && veterinarians.length === 0) {
        return <Spinner label="Cargando veterinarios pendientes..." />
    }

    if (error && veterinarians.length === 0) {
        return (
            <ErrorMessage
                message={getApiErrorMessage(error, {
                    fallback: 'No se pudieron cargar los veterinarios pendientes.',
                })}
                onRetry={reload}
            />
        )
    }

    return (
        <div>
            {notice && (
                <p role="status" className="bg-green-50 border border-green-100 rounded-lg p-3 mb-4 text-sm text-gray-900">
                    {notice}
                </p>
            )}

            {veterinarians.length === 0 ? (
                <EmptyState
                    icon={UserCheck}
                    title="No hay veterinarios pendientes"
                    description="Todas las cuentas de veterinario están aprobadas."
                />
            ) : (
                <>
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
                        {veterinarians.map((vet) => (
                            <li key={vet.id} className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="font-medium text-gray-900">{vet.name}</p>
                                        <p className="text-sm text-gray-500 break-all">{vet.email}</p>
                                        <p className="text-sm text-gray-500">
                                            Licencia: {vet.licenseNumber || 'No informada'} · Registro:{' '}
                                            {formatDate(vet.createdAt)}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleApprove(vet)}
                                        disabled={approvingId !== null}
                                        aria-label={`Aprobar a ${vet.name}`}
                                        className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 bg-brand text-white text-sm font-medium rounded-md disabled:opacity-60 shrink-0"
                                    >
                                        <Check size={16} aria-hidden="true" />
                                        {approvingId === vet.id ? 'Aprobando...' : 'Aprobar'}
                                    </button>
                                </div>

                                {rowErrors[vet.id] && (
                                    <p className="text-sm text-risk-toxic mt-2">{rowErrors[vet.id]}</p>
                                )}
                            </li>
                        ))}
                    </ul>

                    <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} disabled={loading} />
                </>
            )}
        </div>
    )
}

export default PendingVeterinariansTab