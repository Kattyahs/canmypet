import { useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { searchFoods } from '../../api/foods'
import { getFoodCategoryLabel } from '../../constants/foodCategories'
import FoodThumb from '../FoodThumb'

const MIN_QUERY_LENGTH = 2

function FoodAutocomplete({ id, label, query, onQueryChange, onSelect }) {
    const [suggestions, setSuggestions] = useState([])
    const [searched, setSearched] = useState(false)
    const [failed, setFailed] = useState(false)
    const latestSearch = useRef(0)

    const handleChange = async (value) => {
        onQueryChange(value)
        const searchId = ++latestSearch.current

        if (value.trim().length < MIN_QUERY_LENGTH) {
            setSuggestions([])
            setSearched(false)
            setFailed(false)
            return
        }

        try {
            const res = await searchFoods(value.trim())
            if (searchId === latestSearch.current) {
                setSuggestions(res.data)
                setSearched(true)
                setFailed(false)
            }
        } catch {
            if (searchId === latestSearch.current) {
                setSuggestions([])
                setSearched(true)
                setFailed(true)
            }
        }
    }

    const choose = (food) => {
        latestSearch.current += 1
        setSuggestions([])
        setSearched(false)
        setFailed(false)
        onSelect(food)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && suggestions.length > 0) {
            e.preventDefault()
            const typed = query.trim().toLowerCase()
            choose(suggestions.find((f) => f.name.toLowerCase() === typed) ?? suggestions[0])
        }
        if (e.key === 'Escape') setSuggestions([])
    }

    const typedEnough = query.trim().length >= MIN_QUERY_LENGTH
    const showNoResults = searched && !failed && suggestions.length === 0 && typedEnough
    const showError = searched && failed && typedEnough

    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={id} className="font-mono text-xs uppercase tracking-wide text-gray-500">
                {label}
            </label>
            <div className="relative">
                <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    aria-hidden="true"
                />
                <input
                    id={id}
                    type="text"
                    autoComplete="off"
                    value={query}
                    onChange={(e) => handleChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Chocolate, uvas, cebolla..."
                    className="w-full min-h-[44px] pl-10 pr-3 border border-gray-300 rounded-md text-base md:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand"
                />
                {suggestions.length > 0 && (
                    <ul className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-64 overflow-y-auto">
                        {suggestions.map((food) => (
                            <li key={food.id}>
                                <button
                                    type="button"
                                    onClick={() => choose(food)}
                                    className="w-full min-h-[44px] px-3 py-2 flex items-center gap-3 text-left hover:bg-bone"
                                >
                                    <FoodThumb name={food.name} category={food.category} />
                                    <span className="min-w-0">
                                        <span className="block text-sm text-gray-900">{food.name}</span>
                                        <span className="block text-xs text-gray-500">{getFoodCategoryLabel(food.category)}</span>
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {showNoResults && (
                <p className="text-xs text-gray-500">
                    No encontramos «{query.trim()}». Prueba con otro nombre, por ejemplo «palta» o «plátano».
                </p>
            )}
            {showError && (
                <p role="alert" className="text-xs text-red-700">
                    No pudimos buscar alimentos en este momento. Intenta de nuevo en unos segundos.
                </p>
            )}
        </div>
    )
}

export default FoodAutocomplete