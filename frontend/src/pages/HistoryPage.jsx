import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, ClipboardList, Clock } from 'lucide-react'
import { getMyHistory } from '../api/searchHistory'
import { getFoodsByIds } from '../api/foods'
import { getMyPets } from '../api/pets'
import { describeConsultation } from '../utils/searchHistory'
import { groupByDay, timeLabel } from '../utils/dateGroups'
import FoodThumb from '../components/FoodThumb'
import PetAvatar from '../components/PetAvatar'
import { usePagination } from '../hooks/usePagination'
import { getApiErrorMessage } from '../utils/apiError'
import Pagination from '../components/Pagination'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import ErrorMessage from '../components/ErrorMessage'

const PAGE_SIZE = 20

const CHIP =
    'inline-flex items-center gap-2 min-h-[44px] pl-1.5 pr-4 rounded-full border text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand'

function HistoryPage() {
    const [petFilter, setPetFilter] = useState(null)
    const fetchHistory = useCallback(
        ({ page, size }) => getMyHistory({ page, size, ...(petFilter ? { petId: petFilter } : {}) }),
        [petFilter]
    )
    const { items: history, page, totalPages, loading, error, goToPage, reload } = usePagination(fetchHistory, {
        size: PAGE_SIZE,
    })
    const [petList, setPetList] = useState([])
    const [foods, setFoods] = useState({})
    const requestedFoodIds = useRef(new Set())

    useEffect(() => {
        getMyPets()
            .then((res) => setPetList(res.data))
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
                missing.forEach((id) => requestedFoodIds.current.delete(id))
            })
    }, [history])

    const choosePet = (petId) => {
        setPetFilter(petId)
        goToPage(0)
    }

    const pets = Object.fromEntries(petList.map((p) => [p.id, p]))
    const filteredPet = petFilter ? pets[petFilter] : null
    const initialLoading = loading && history.length === 0
    const groups = groupByDay(history, (entry) => entry.searchedAt)

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Historial</h1>
                <p className="text-sm text-gray-500 mt-1">Vuelve a tus consultas anteriores.</p>
            </div>

            {petList.length > 0 && (
                <div role="group" aria-label="Filtrar por mascota" className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        aria-pressed={petFilter === null}
                        onClick={() => choosePet(null)}
                        className={`${CHIP} pl-4 ${
                            petFilter === null
                                ? 'bg-brand-soft border-brand-soft text-brand font-semibold'
                                : 'bg-white border-gray-200 text-gray-700 hover:bg-bone'
                        }`}
                    >
                        Todas
                    </button>
                    {petList.map((pet) => {
                        const selected = petFilter === pet.id
                        return (
                            <button
                                key={pet.id}
                                type="button"
                                aria-pressed={selected}
                                onClick={() => choosePet(pet.id)}
                                className={`${CHIP} ${
                                    selected
                                        ? 'bg-brand-soft border-brand-soft text-brand font-semibold'
                                        : 'bg-white border-gray-200 text-gray-700 hover:bg-bone'
                                }`}
                            >
                                <PetAvatar pet={pet} size="sm" />
                                {pet.name}
                            </button>
                        )
                    })}
                </div>
            )}

            {initialLoading && <Spinner label="Cargando historial..." />}

            {error && (
                <ErrorMessage
                    message={getApiErrorMessage(error, { fallback: 'No se pudo cargar el historial.' })}
                    onRetry={reload}
                />
            )}

            {!loading && !error && history.length === 0 && (
                <EmptyState
                    icon={ClipboardList}
                    title={
                        filteredPet
                            ? `Aún no has consultado alimentos para ${filteredPet.name}`
                            : 'Aún no has consultado ningún alimento'
                    }
                >
                    <Link
                        to={filteredPet ? `/search?petId=${filteredPet.id}` : '/search'}
                        className="text-sm text-brand font-medium"
                    >
                        Buscar un alimento
                    </Link>
                </EmptyState>
            )}

            {history.length > 0 && (
                <div aria-busy={loading} className="flex flex-col gap-6">
                    {groups.map((group) => (
                        <section key={group.key} aria-label={group.label} className="flex flex-col gap-2">
                            <h2 className="text-base font-semibold text-gray-900">{group.label}</h2>
                            <ul className="flex flex-col gap-2">
                                {group.items.map((entry) => {
                                    const food = foods[entry.foodId]
                                    const pet = entry.petId ? pets[entry.petId] : null
                                    return (
                                        <li
                                            key={entry.id}
                                            className="flex items-center gap-3 sm:gap-4 p-3 sm:pr-4 bg-white border border-gray-100 rounded-2xl shadow-card"
                                        >
                                            <FoodThumb name={food?.name} category={food?.category} size="md" />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-900 truncate">
                                                    {food?.name || `Alimento #${entry.foodId}`}
                                                </p>
                                                <p className="text-sm text-gray-500 truncate">
                                                    {describeConsultation(entry, pet)}
                                                </p>
                                                <p className="sm:hidden text-xs text-gray-400">{timeLabel(entry.searchedAt)}</p>
                                            </div>
                                            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-gray-400">
                                                <Clock size={12} aria-hidden="true" />
                                                {timeLabel(entry.searchedAt)}
                                            </span>
                                            {food && pet && (
                                                <Link
                                                    to={`/search?petId=${pet.id}`}
                                                    aria-label={`Consultar de nuevo ${food.name} para ${pet.name}`}
                                                    className="shrink-0 inline-flex items-center justify-center gap-0.5 min-h-[44px] min-w-[44px] rounded-xl text-sm font-medium text-brand hover:bg-brand-muted sm:px-2"
                                                >
                                                    <span className="hidden sm:inline">Consultar de nuevo</span>
                                                    <ChevronRight size={18} aria-hidden="true" />
                                                </Link>
                                            )}
                                        </li>
                                    )
                                })}
                            </ul>
                        </section>
                    ))}
                </div>
            )}

            <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} disabled={loading} />
        </div>
    )
}

export default HistoryPage