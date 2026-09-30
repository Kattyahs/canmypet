import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
        <section aria-labelledby="recent-searches-title" className="bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between px-4 md:px-5 py-3 border-b border-gray-100">
                <h2 id="recent-searches-title" className="text-base font-semibold text-gray-900">
                    Consultas recientes
                </h2>
                <Link to="/history" className="text-sm text-brand">
                    Ver historial
                </Link>
            </div>
            <ul>
                {items.map((item) => {
                    const pet = findPet(item.petId)
                    const target = pet ? { petId: pet.id } : { species: item.species ?? null, lifeStage: item.lifeStage ?? null }
                    const labelTarget = pet ? pet.name : item.species ? describeTarget(item) : null
                    return (
                        <li
                            key={item.id}
                            className="flex items-center justify-between gap-3 px-4 md:px-5 py-2 border-t border-gray-100 first:border-t-0"
                        >
                            <div className="min-w-0 flex items-center gap-3">
                                <FoodThumb name={item.food.name} category={item.food.category} />
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{item.food.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {describeConsultation(item, pet)} · {formatDate(item.searchedAt)}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => onRepeat(item.food, target)}
                                aria-label={`Consultar de nuevo ${item.food.name}${labelTarget ? ` para ${labelTarget}` : ''}`}
                                className="shrink-0 min-h-[44px] text-sm font-medium text-brand"
                            >
                                Consultar de nuevo
                            </button>
                        </li>
                    )
                })}
            </ul>
        </section>
    )
}

export default RecentSearches