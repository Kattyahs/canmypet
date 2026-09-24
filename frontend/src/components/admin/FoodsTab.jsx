import { useState } from 'react'
import { Plus, Search, X } from 'lucide-react'
import FoodForm from './FoodForm'
import FoodCatalogList from './FoodCatalogList'

const INPUT =
    'w-full min-h-[44px] pl-9 pr-3 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand'

function FoodsTab() {
    const [searchInput, setSearchInput] = useState('')
    const [query, setQuery] = useState('')
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [notice, setNotice] = useState('')
    const [listVersion, setListVersion] = useState(0)

    const handleSearch = (e) => {
        e.preventDefault()
        setNotice('')
        setQuery(searchInput.trim())
    }

    const clearSearch = () => {
        setSearchInput('')
        setQuery('')
    }

    const handleCreated = (food) => {
        setShowCreateForm(false)
        setSearchInput('')
        setQuery('')
        setListVersion((v) => v + 1)
        setNotice(`"${food.name}" se agregó al catálogo.`)
    }

    const handleUpdated = (food) => {
        setNotice(`"${food.name}" se actualizó.`)
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
                <form role="search" onSubmit={handleSearch} className="flex flex-1 gap-2">
                    <div className="relative flex-1">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            aria-hidden="true"
                        />
                        <label htmlFor="food-catalog-search" className="sr-only">
                            Buscar alimento en el catálogo
                        </label>
                        <input
                            id="food-catalog-search"
                            type="search"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Buscar por nombre"
                            className={INPUT}
                        />
                    </div>
                    <button
                        type="submit"
                        className="min-h-[44px] px-4 border border-gray-300 bg-white text-sm font-medium rounded-md text-gray-700"
                    >
                        Buscar
                    </button>
                    {query && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            aria-label="Quitar búsqueda"
                            className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] border border-gray-300 bg-white rounded-md text-gray-700"
                        >
                            <X size={16} aria-hidden="true" />
                        </button>
                    )}
                </form>

                {!showCreateForm && (
                    <button
                        type="button"
                        onClick={() => {
                            setNotice('')
                            setShowCreateForm(true)
                        }}
                        className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 bg-brand text-white text-sm font-medium rounded-md"
                    >
                        <Plus size={16} aria-hidden="true" />
                        Nuevo alimento
                    </button>
                )}
            </div>

            {showCreateForm && <FoodForm onSaved={handleCreated} onCancel={() => setShowCreateForm(false)} />}

            {notice && (
                <p role="status" className="bg-green-50 border border-green-100 rounded-lg p-3 text-sm text-gray-900">
                    {notice}
                </p>
            )}

            <FoodCatalogList key={`${query}-${listVersion}`} query={query} onUpdated={handleUpdated} />
        </div>
    )
}

export default FoodsTab