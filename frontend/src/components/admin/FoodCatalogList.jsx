import { useCallback, useState } from 'react'
import { Apple, Pencil } from 'lucide-react'
import { getAllFoods } from '../../api/foods'
import { getApiErrorMessage } from '../../utils/apiError'
import { usePagination } from '../../hooks/usePagination'
import Spinner from '../Spinner'
import EmptyState from '../EmptyState'
import ErrorMessage from '../ErrorMessage'
import Pagination from '../Pagination'
import FoodForm from './FoodForm'
import FoodThumb from '../FoodThumb'
import { getFoodCategoryLabel } from '../../constants/foodCategories'

const PAGE_SIZE = 10

function FoodCatalogList({ query, onUpdated }) {
    const fetchFoods = useCallback(
        ({ page, size }) => getAllFoods({ query: query || undefined, page, size }),
        [query]
    )
    const { items: foods, page, totalPages, loading, error, goToPage, reload } = usePagination(fetchFoods, {
        size: PAGE_SIZE,
    })
    const [editingId, setEditingId] = useState(null)

    const handleSaved = async (saved) => {
        setEditingId(null)
        onUpdated(saved)
        await reload()
    }

    if (loading && foods.length === 0) {
        return <Spinner label="Cargando alimentos..." />
    }

    if (error && foods.length === 0) {
        return (
            <ErrorMessage
                message={getApiErrorMessage(error, { fallback: 'No se pudieron cargar los alimentos.' })}
                onRetry={reload}
            />
        )
    }

    if (foods.length === 0) {
        return query ? (
            <EmptyState
                icon={Apple}
                title={`No hay alimentos que coincidan con "${query}"`}
                description="Prueba con otra palabra o crea el alimento."
            />
        ) : (
            <EmptyState icon={Apple} title="El catálogo está vacío" description="Crea el primer alimento." />
        )
    }

    return (
        <div>
            {error && (
                <div className="mb-3">
                    <ErrorMessage
                        message={getApiErrorMessage(error, { fallback: 'No se pudo actualizar la lista.' })}
                        onRetry={reload}
                    />
                </div>
            )}

            <ul aria-busy={loading} className="space-y-3">
                {foods.map((food) =>
                    editingId === food.id ? (
                        <li key={food.id}>
                            <FoodForm food={food} onSaved={handleSaved} onCancel={() => setEditingId(null)} />
                        </li>
                    ) : (
                        <li
                            key={food.id}
                            className="bg-white border border-gray-100 rounded-2xl shadow-card p-4 flex flex-col md:flex-row md:items-start md:justify-between gap-3"
                        >
                            <div className="min-w-0 flex items-start gap-3">
                                <FoodThumb name={food.name} category={food.category} size="md" />
                                <div className="min-w-0">
                                    <p className="font-medium text-gray-900">{food.name}</p>
                                    <p className="text-sm text-gray-500">{getFoodCategoryLabel(food.category)}</p>
                                    {food.description && <p className="text-sm text-gray-700 mt-1">{food.description}</p>}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditingId(food.id)}
                                disabled={editingId !== null}
                                aria-label={`Editar ${food.name}`}
                                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 border border-gray-200 bg-white text-sm font-medium rounded-xl text-gray-700 disabled:opacity-60 shrink-0"
                            >
                                <Pencil size={16} aria-hidden="true" />
                                Editar
                            </button>
                        </li>
                    )
                )}
            </ul>

            <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} disabled={loading} />
        </div>
    )
}

export default FoodCatalogList