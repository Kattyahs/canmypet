import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList } from 'lucide-react'
import { getMyHistory } from '../api/searchHistory'
import { getFoodsByIds } from '../api/foods'
import { getMyPets } from '../api/pets'
import { getSpeciesLabel } from '../constants/species'
import { usePagination } from '../hooks/usePagination'
import { getApiErrorMessage } from '../utils/apiError'
import Pagination from '../components/Pagination'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import ErrorMessage from '../components/ErrorMessage'

const PAGE_SIZE = 20

const fetchHistory = ({ page, size }) => getMyHistory({ page, size })

const formatDate = (isoString) => {
    if (!isoString) return ''
    return new Intl.DateTimeFormat('es-CL', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(isoString))
}

function HistoryPage() {
    const { items: history, page, totalPages, loading, error, goToPage, reload } = usePagination(
        fetchHistory,
        { size: PAGE_SIZE }
    )
    const [pets, setPets] = useState({})
    const [foods, setFoods] = useState({})
    // Food ids already requested, so paging back and forth never asks twice
    const requestedFoodIds = useRef(new Set())

    useEffect(() => {
        getMyPets()
            .then((res) => setPets(Object.fromEntries(res.data.map((p) => [p.id, p]))))
            .catch(() => {})
    }, [])

    useEffect(() => {
        const missing = [...new Set(history.map((entry) => entry.foodId))].filter(
            (id) => !requestedFoodIds.current.has(id)
        )
        if (missing.length === 0) return
        missing.forEach((id) => requestedFoodIds.current.add(id))

        getFoodsByIds(missing)
            .then((res) =>
                setFoods((prev) => ({
                    ...prev,
                    ...Object.fromEntries(res.data.map((food) => [food.id, food])),
                }))
            )
            .catch(() => {
                // Names fall back to "Alimento #id"; allow a retry on the next page
                missing.forEach((id) => requestedFoodIds.current.delete(id))
            })
    }, [history])

    const initialLoading = loading && history.length === 0

    return (
        <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Historial</h1>
            <p className="text-sm text-gray-500 mb-6">
                Todas las consultas de riesgo que has realizado.
            </p>

            {initialLoading && <Spinner label="Cargando historial..." />}

            {error && (
                <ErrorMessage
                    message={getApiErrorMessage(error, { fallback: 'No se pudo cargar el historial.' })}
                    onRetry={reload}
                />
            )}

            {!loading && !error && history.length === 0 && (
                <EmptyState icon={ClipboardList} title="Aún no has consultado ningún alimento">
                    <Link to="/search" className="text-sm text-brand font-medium">
                        Buscar un alimento
                    </Link>
                </EmptyState>
            )}

            {history.length > 0 && (
                <div
                    aria-busy={loading}
                    className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100"
                >
                    {history.map((entry) => {
                        const food = foods[entry.foodId]
                        const pet = entry.petId ? pets[entry.petId] : null

                        return (
                            <div
                                key={entry.id}
                                className="p-4 flex items-center justify-between gap-4 flex-wrap"
                            >
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {food?.name || `Alimento #${entry.foodId}`}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {pet
                                            ? `${pet.name} · ${getSpeciesLabel(pet.species)}${pet.lifeStage ? ` · ${pet.lifeStage}` : ''}`
                                            : 'Consulta general'}
                                    </p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className="font-mono text-xs text-gray-400">
                                        {formatDate(entry.searchedAt)}
                                    </span>
                                    {food && pet && (
                                        <Link
                                            to={`/search?petId=${pet.id}`}
                                            className="text-sm text-brand font-medium"
                                        >
                                            Consultar de nuevo
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} disabled={loading} />
        </div>
    )
}

export default HistoryPage