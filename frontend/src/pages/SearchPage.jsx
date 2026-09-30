import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PawPrint, Search } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getFoodSafetyAllSpecies } from '../api/foods'
import { getMyPets } from '../api/pets'
import { recordSearch } from '../api/searchHistory'
import { SPECIES } from '../constants/species'
import { LIFE_STAGE_LABELS } from '../constants/lifeStages'
import FoodAutocomplete from '../components/search/FoodAutocomplete'
import PetPicker from '../components/search/PetPicker'
import SearchResult from '../components/search/SearchResult'
import Spinner from '../components/Spinner'
import RecentSearches from '../components/search/RecentSearches'
import EmergencyBanner from '../components/search/EmergencyBanner'
import SegmentedTabs from '../components/ui/SegmentedTabs'
import Card from '../components/ui/Card'
import { consultationKey } from '../utils/searchHistory'

const TABS = [
    { value: 'pets', label: 'Mis mascotas', Icon: PawPrint },
    { value: 'general', label: 'Buscador general', Icon: Search },
]

const FIELD_LABEL = 'text-sm font-medium text-gray-700'
const SELECT =
    'min-h-[52px] px-4 border border-gray-200 rounded-xl text-base md:text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand disabled:bg-bone disabled:text-gray-400'

function SearchPage() {
    const { user } = useAuth()
    const [searchParams] = useSearchParams()
    const [pets, setPets] = useState([])
    const [petsLoading, setPetsLoading] = useState(true)
    const [tab, setTab] = useState(null)
    const [selectedPetId, setSelectedPetId] = useState(null)
    const [query, setQuery] = useState('')
    const [food, setFood] = useState(null)
    const [lookup, setLookup] = useState(null)
    const [generalSpecies, setGeneralSpecies] = useState('')
    const [generalStage, setGeneralStage] = useState('')
    const latestLookup = useRef(0)
    const tracked = useRef(new Set())

    useEffect(() => {
        getMyPets()
            .then((res) => setPets(res.data))
            .catch(() => setPets([]))
            .finally(() => setPetsLoading(false))
    }, [])

    const paramPetId = searchParams.get('petId')
    const autoPetId =
        pets.find((p) => String(p.id) === paramPetId)?.id ?? (pets.length === 1 ? pets[0].id : null)
    const petId = selectedPetId ?? autoPetId
    const selectedPet = pets.find((p) => String(p.id) === String(petId)) ?? null
    const activeTab = tab ?? (pets.length > 0 ? 'pets' : 'general')

    const track = (foodId, target) => {
        const payload = target.petId
            ? { petId: target.petId, foodId }
            : { foodId, species: target.species || null, lifeStage: target.lifeStage || null }
        const key = consultationKey(payload)
        if (tracked.current.has(key)) return
        tracked.current.add(key)
        recordSearch(payload).catch(() => tracked.current.delete(key))
    }

    const generalTarget = (species = generalSpecies, lifeStage = generalStage) => ({
        species,
        lifeStage: species ? lifeStage : '',
    })

    const loadEntries = (target) => {
        const lookupId = ++latestLookup.current
        setLookup({ foodId: target.id, loading: true, entries: [], error: null })
        getFoodSafetyAllSpecies(target.id)
            .then((res) => {
                if (lookupId === latestLookup.current) {
                    setLookup({ foodId: target.id, loading: false, entries: res.data, error: null })
                }
            })
            .catch((err) => {
                if (lookupId === latestLookup.current) {
                    setLookup({ foodId: target.id, loading: false, entries: [], error: err })
                }
            })
    }

    const handleSelectFood = (selected) => {
        setFood(selected)
        setQuery(selected.name)
        loadEntries(selected)
        if (activeTab === 'general') track(selected.id, generalTarget())
        else if (petId) track(selected.id, { petId })
    }

    const handleQueryChange = (value) => {
        setQuery(value)
        if (food && value !== food.name) {
            latestLookup.current += 1
            setFood(null)
            setLookup(null)
        }
    }
    const handleSelectPet = (id) => {
        setSelectedPetId(id)
        if (food) track(food.id, { petId: id })
    }

    const showTab = (id, target = generalTarget()) => {
        setTab(id)
        if (!food) return
        if (id === 'general') track(food.id, target)
        else if (petId) track(food.id, { petId })
    }

    const showAllSpecies = () => {
        setGeneralSpecies('')
        setGeneralStage('')
        showTab('general', generalTarget('', ''))
    }

    const pickEntry = (entry) => {
        setGeneralSpecies(entry.species)
        setGeneralStage(entry.lifeStage ?? '')
        if (food) track(food.id, generalTarget(entry.species, entry.lifeStage ?? ''))
    }

    const repeatSearch = (repeated, target) => {
        if (target.petId) {
            setTab('pets')
            setSelectedPetId(target.petId)
        } else {
            setTab('general')
            setGeneralSpecies(target.species ?? '')
            setGeneralStage(target.species ? target.lifeStage ?? '' : '')
        }
        setFood(repeated)
        setQuery(repeated.name)
        loadEntries(repeated)
        track(repeated.id, target)
    }

    const handleSpeciesChange = (value) => {
        setGeneralSpecies(value)
        if (!value) setGeneralStage('')
        if (food) track(food.id, generalTarget(value))
    }

    const handleStageChange = (value) => {
        setGeneralStage(value)
        if (food) track(food.id, generalTarget(generalSpecies, value))
    }

    const firstName = user?.name?.split(' ')[0]

    return (
        <div className="flex flex-col gap-6">
            <div>
                {firstName && <p className="text-sm text-gray-500 mb-1">Hola, {firstName}</p>}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">¿Qué puede comer tu mascota?</h1>
                <p className="text-sm text-gray-500">Busca un alimento y descubre si es seguro antes de dárselo.</p>
            </div>

            <Card className="flex flex-col gap-5">
                <SegmentedTabs
                    options={TABS}
                    value={activeTab}
                    onChange={(id) => showTab(id)}
                    label="Tipo de búsqueda"
                    idPrefix="search-tab"
                    panelId="search-panel"
                    className="md:max-w-md"
                />

                <div id="search-panel" role="tabpanel" aria-labelledby={`search-tab-${activeTab}`} className="flex flex-col gap-5">
                    {petsLoading ? (
                        <Spinner label="Cargando tus mascotas..." />
                    ) : activeTab === 'pets' ? (
                        <>
                            {pets.length > 0 ? (
                                <PetPicker pets={pets} selectedPetId={petId} onSelect={handleSelectPet} />
                            ) : (
                                <div className="flex flex-col gap-2 p-4 rounded-xl bg-brand-muted">
                                    <p className="text-sm text-gray-700">Todavía no registras mascotas.</p>
                                    <div className="flex flex-wrap gap-x-4">
                                        <Link to="/pets" className="min-h-[44px] inline-flex items-center text-sm font-medium text-brand">
                                            Registrar una mascota
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => showTab('general')}
                                            className="min-h-[44px] text-sm font-medium text-brand"
                                        >
                                            Usar el buscador general
                                        </button>
                                    </div>
                                </div>
                            )}
                            <FoodAutocomplete
                                id="food-search-pets"
                                label="¿Qué comió o quiere comer?"
                                query={query}
                                onQueryChange={handleQueryChange}
                                onSelect={handleSelectFood}
                            />
                        </>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:items-end">
                            <div className="md:col-span-2">
                                <FoodAutocomplete
                                    id="food-search-general"
                                    label="Alimento"
                                    query={query}
                                    onQueryChange={handleQueryChange}
                                    onSelect={handleSelectFood}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label htmlFor="general-species" className={FIELD_LABEL}>
                                    Especie
                                </label>
                                <select
                                    id="general-species"
                                    value={generalSpecies}
                                    onChange={(e) => handleSpeciesChange(e.target.value)}
                                    className={SELECT}
                                >
                                    <option value="">Todas las especies</option>
                                    {SPECIES.map((s) => (
                                        <option key={s.value} value={s.value}>
                                            {s.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label htmlFor="general-stage" className={FIELD_LABEL}>
                                    Etapa de vida
                                </label>
                                <select
                                    id="general-stage"
                                    value={generalStage}
                                    onChange={(e) => handleStageChange(e.target.value)}
                                    disabled={!generalSpecies}
                                    className={SELECT}
                                >
                                    <option value="">{generalSpecies ? 'Cualquier etapa' : 'Elige una especie primero'}</option>
                                    {Object.entries(LIFE_STAGE_LABELS).map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {!food && !petsLoading && (
                <>
                    <RecentSearches pets={pets} onRepeat={repeatSearch} />
                    <EmergencyBanner />
                </>
            )}
            {food && lookup && (
                <SearchResult
                    food={food}
                    lookup={lookup}
                    activeTab={activeTab}
                    selectedPet={selectedPet}
                    generalSpecies={generalSpecies}
                    generalStage={generalStage}
                    onRetry={() => loadEntries(food)}
                    onShowAllSpecies={showAllSpecies}
                    onPickEntry={pickEntry}
                />
            )}
        </div>
    )
}

export default SearchPage