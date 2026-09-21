import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { searchFoods, getFoodSafety, getFoodSafetyAllSpecies } from '../api/foods'
import { getMyPets } from '../api/pets'
import { recordSearch } from '../api/searchHistory'
import { getSpeciesLabel } from '../constants/species'
import { RISK_CONFIG } from '../components/RiskBadge'

function SearchPage() {
    const [searchParams] = useSearchParams()
    const [pets, setPets] = useState([])
    const [selectedPetId, setSelectedPetId] = useState(searchParams.get('petId') || '')
    const [query, setQuery] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [selectedFood, setSelectedFood] = useState(null)
    const [results, setResults] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Mascota usada en la consulta que produjo los resultados actuales.
    // Se guarda aparte de selectedPetId para que el detalle mostrado no cambie
    // si el usuario modifica el selector despues de consultar.
    const [resultPet, setResultPet] = useState(null)

    useEffect(() => {
        getMyPets().then((res) => setPets(res.data)).catch(() => {})
    }, [])

    const selectedPet = pets.find((p) => String(p.id) === String(selectedPetId))

    const handleSearchFoods = async (value) => {
        setQuery(value)
        setSelectedFood(null)
        setResults(null)
        setResultPet(null)
        if (value.length < 2) {
            setSuggestions([])
            return
        }
        try {
            const res = await searchFoods(value)
            setSuggestions(res.data)
        } catch {
            setSuggestions([])
        }
    }

    const handleConsult = async (food) => {
        setSelectedFood(food)
        setSuggestions([])
        setQuery(food.name)
        setError('')
        setLoading(true)
        setResultPet(selectedPet || null)

        try {
            const res = selectedPet
                ? await getFoodSafety(food.id, selectedPet.species, selectedPet.lifeStage)
                : await getFoodSafetyAllSpecies(food.id)

            setResults(res.data)

            await recordSearch({
                petId: selectedPet ? selectedPet.id : null,
                foodId: food.id,
            })
        } catch (err) {
            if (err.response?.status === 404) {
                setResults([])
            } else {
                setError('No se pudo consultar el riesgo de este alimento.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Buscar alimento</h1>
            <p className="text-sm text-gray-500 mb-6">
                Comprueba el nivel de riesgo antes de dárselo a tu mascota.
            </p>

            {/* Buscador */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => handleSearchFoods(e.target.value)}
                            placeholder="Chocolate, uvas, cebolla..."
                            className="w-full min-h-[44px] px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                        />

                        {suggestions.length > 0 && (
                            <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-56 overflow-y-auto">
                                {suggestions.map((food) => (
                                    <button
                                        key={food.id}
                                        onClick={() => handleConsult(food)}
                                        className="w-full text-left px-3 py-2 hover:bg-bone text-sm"
                                    >
                                        <p className="text-gray-900">{food.name}</p>
                                        <p className="text-xs text-gray-500">{food.category}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <select
                        value={selectedPetId}
                        onChange={(e) => setSelectedPetId(e.target.value)}
                        className="min-h-[44px] px-3 border border-gray-300 rounded-md text-sm md:w-64 focus:outline-none focus:ring-2 focus:ring-brand"
                    >
                        <option value="">Todas las especies</option>
                        {pets.map((pet) => (
                            <option key={pet.id} value={pet.id}>
                                {pet.name} · {getSpeciesLabel(pet.species)}
                                {pet.lifeStage ? ` · ${pet.lifeStage}` : ''}
                            </option>
                        ))}
                    </select>
                </div>

                <p className="text-xs text-gray-500 mt-3">
                    Elige una mascota para ajustar el resultado a su especie y etapa de vida, o
                    consulta sin seleccionarla para ver el riesgo en todas las especies.
                </p>

                {error && <p className="text-sm text-risk-toxic mt-3">{error}</p>}
            </div>

            {loading && <p className="text-sm text-gray-400">Consultando...</p>}

            {/* Sin resultados */}
            {results && results.length === 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                    <p className="text-sm text-gray-500">
                        Todavía no hay información de seguridad registrada para{' '}
                        <span className="font-medium text-gray-900">{selectedFood?.name}</span>
                        {resultPet ? ` en ${getSpeciesLabel(resultPet.species)}` : ''}.
                    </p>
                    <Link to="/faq" className="text-sm text-brand font-medium mt-2 inline-block">
                        Preguntar en el FAQ
                    </Link>
                </div>
            )}

            {/* Resultados */}
            {results && results.length > 0 && (
                <div className="space-y-4">
                    {!resultPet && results.length > 1 && (
                        <p className="text-sm text-gray-500">
                            Resultados para {results.length} especies. Selecciona una mascota para
                            ver solo la que te interesa.
                        </p>
                    )}

                    {results.map((entry) => {
                        const config = RISK_CONFIG[entry.riskLevel]
                        const Icon = config?.Icon
                        return (
                            <div
                                key={entry.id}
                                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                            >
                                {/* Cabecera con color por nivel */}
                                <div className={`${config?.bg} ${config?.border} border-b p-5`}>
                                    <p className="font-mono text-xs uppercase tracking-wide text-gray-500 mb-1">
                                        Nivel de riesgo · {getSpeciesLabel(entry.species)}
                                    </p>
                                    <div className="flex items-center gap-2 mb-1">
                                        {Icon && <Icon size={24} className={config.text} />}
                                        <h2 className={`text-2xl font-bold ${config?.text}`}>{entry.riskLevel}</h2>
                                    </div>
                                    <p className={`text-sm ${config?.text}`}>{config?.verdict}</p>
                                </div>

                                {/* Detalles */}
                                <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-100">
                                    <div>
                                        <p className="font-mono text-xs uppercase tracking-wide text-gray-500 mb-1">
                                            Alimento
                                        </p>
                                        <p className="text-gray-900 font-medium">{entry.foodName}</p>
                                    </div>
                                    <div>
                                        <p className="font-mono text-xs uppercase tracking-wide text-gray-500 mb-1">
                                            Evaluado para
                                        </p>
                                        <p className="text-gray-900 font-medium">
                                            {resultPet ? resultPet.name : getSpeciesLabel(entry.species)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {resultPet ? `${getSpeciesLabel(entry.species)} · ` : ''}
                                            {entry.lifeStage ? entry.lifeStage : 'todas las edades'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="font-mono text-xs uppercase tracking-wide text-gray-500 mb-1">
                                            Estado
                                        </p>
                                        <p className="text-gray-900 font-medium">
                                            {entry.verifiedStatus === 'VERIFIED'
                                                ? 'Verificado por veterinario'
                                                : 'Pendiente de verificación'}
                                        </p>
                                    </div>
                                </div>

                                {/* Notas */}
                                {entry.notes && (
                                    <div className="p-5 border-b border-gray-100">
                                        <p className="font-mono text-xs uppercase tracking-wide text-gray-500 mb-1">
                                            Notas
                                        </p>
                                        <p className="text-sm text-gray-700">{entry.notes}</p>
                                    </div>
                                )}

                                {/* Fuentes */}
                                {entry.sources?.length > 0 && (
                                    <div className="p-5 border-b border-gray-100">
                                        <p className="font-mono text-xs uppercase tracking-wide text-gray-500 mb-2">
                                            Fuentes
                                        </p>
                                        <ul className="space-y-1">
                                            {entry.sources.map((source) => (
                                                <li key={source.id} className="text-sm">
                                                    {source.sourceUrl ? (
                                                        <a
                                                            href={source.sourceUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-brand"
                                                        >
                                                            {source.sourceName}
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-700">{source.sourceName}</span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Acción de emergencia, solo si el riesgo lo amerita */}
                                {entry.riskLevel !== 'SAFE' && (
                                    <div className="p-5 flex items-center justify-between gap-4">
                                        <p className="text-sm text-gray-600">
                                            Si ya lo ingirió, actúa en los próximos minutos.
                                        </p>
                                        <Link
                                            to={`/emergency/${entry.riskLevel}`}
                                            className="shrink-0 flex items-center gap-2 px-4 py-2 bg-risk-toxic text-white text-sm font-medium rounded-md"
                                        >
                                            <AlertTriangle size={16} />
                                            Guía de emergencia
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default SearchPage