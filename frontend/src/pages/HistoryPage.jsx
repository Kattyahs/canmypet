import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMyHistory } from '../api/searchHistory'
import { getAllFoods } from '../api/foods'
import { getMyPets } from '../api/pets'

function HistoryPage() {
    const [history, setHistory] = useState([])
    const [foods, setFoods] = useState({})
    const [pets, setPets] = useState({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            try {
                const [historyRes, foodsRes, petsRes] = await Promise.all([
                    getMyHistory(),
                    getAllFoods(),
                    getMyPets(),
                ])

                setHistory(historyRes.data)

                const foodMap = {}
                foodsRes.data.forEach((f) => {
                    foodMap[f.id] = f
                })
                setFoods(foodMap)

                const petMap = {}
                petsRes.data.forEach((p) => {
                    petMap[p.id] = p
                })
                setPets(petMap)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const formatDate = (isoString) => {
        if (!isoString) return ''
        return new Intl.DateTimeFormat('es-CL', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(isoString))
    }

    return (
        <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Historial</h1>
            <p className="text-sm text-gray-500 mb-6">
                Todas las consultas de riesgo que has realizado.
            </p>

            {loading && <p className="text-sm text-gray-400">Cargando...</p>}

            {!loading && history.length === 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                    <p className="text-sm text-gray-500 mb-2">Aún no has consultado ningún alimento.</p>
                    <Link to="/search" className="text-sm text-brand font-medium">
                        Buscar un alimento
                    </Link>
                </div>
            )}

            {!loading && history.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
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
                                            ? `${pet.name} · ${pet.species}${pet.lifeStage ? ` · ${pet.lifeStage}` : ''}`
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
        </div>
    )
}

export default HistoryPage