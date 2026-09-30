import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { getMyHistory } from '../../api/searchHistory'
import { getFoodsByIds } from '../../api/foods'
import { consultationKey, describeConsultation, describeTarget } from '../../utils/searchHistory'
import FoodThumb from '../FoodThumb'

const MAX_ITEMS = 3
const HISTORY_SAMPLE = 10

const formatDate = (isoString) =>
    isoString
        ? new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short' }).format(new Date(isoString))
        : ''

const uniqueConsultations = (history) => {
    const seen = new Set()
    return history.filter((item) => {
        const key = consultationKey(item)
        if (seen.has(key)) return false
        seen.add(key)
        return true
    })
}

function RecentSearches({ pets, onRepeat }) {
    const [items, setItems] = useState(null)

    useEffect(() => {
        let active = true
        getMyHistory({ page: 0, size: HISTORY_SAMPLE })
            .then(async (res) => {
                const recent = uniqueConsultations(res.data.content).slice(0, MAX_ITEMS)
                if (recent.length === 0) return []
                const foods = await getFoodsByIds([...new Set(recent.map((r) => r.foodId))])
                const byId = Object.fromEntries(foods.data.map((f) => [f.id, f]))
                return recent.filter((r) => byId[r.foodId]).map((r) => ({ ...r, food: byId[r.foodId] }))
            })
            .then((result) => {
                if (active) setItems(result)
            })
            .catch(() => {
                if (active) setItems([])
            })
        return () => {
            active = false
        }
    }, [])

    if (!items || items.length === 0) return null

    const findPet = (petId) => (petId ? pets.find((p) => p.id === petId) : null)

    return (
        <section aria-labelledby="recent-searches-title" className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <h2 id="recent-searches-title" className="text-lg font-semibold text-gray-900">
                    Consultas recientes
                </h2>
                <Link to="/history" className="min-h-[44px] inline-flex items-center text-sm font-medium text-brand">
                    Ver historial
                </Link>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {items.map((item) => {
                    const pet = findPet(item.petId)
                    const target = pet ? { petId: pet.id } : { species: item.species ?? null, lifeStage: item.lifeStage ?? null }
                    const labelTarget = pet ? pet.name : item.species ? describeTarget(item) : null
                    return (
                        <li key={item.id}>
                            <button
                                type="button"
                                onClick={() => onRepeat(item.food, target)}
                                aria-label={`Consultar de nuevo ${item.food.name}${labelTarget ? ` para ${labelTarget}` : ''}`}
                                className="w-full h-full flex sm:flex-col items-center sm:items-stretch gap-3 p-3 bg-white border border-gray-100 rounded-2xl shadow-card text-left transition-shadow hover:shadow-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                            >
                                <span className="sm:hidden">
                                    <FoodThumb name={item.food.name} category={item.food.category} size="md" />
                                </span>
                                <span className="hidden sm:block">
                                    <FoodThumb name={item.food.name} category={item.food.category} size="cover" />
                                </span>
                                <span className="flex-1 min-w-0 sm:px-1">
                                    <span className="block text-sm font-semibold text-gray-900 truncate">{item.food.name}</span>
                                    <span className="block text-xs text-gray-500">
                                        {describeConsultation(item, pet)} · {formatDate(item.searchedAt)}
                                    </span>
                                </span>
                                <ChevronRight size={18} className="sm:hidden shrink-0 text-gray-400" aria-hidden="true" />
                            </button>
                        </li>
                    )
                })}
            </ul>
        </section>
    )
}

export default RecentSearches