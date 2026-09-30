import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Clock, HelpCircle, ListChecks, Phone, RotateCcw } from 'lucide-react'
import { getMyPets } from '../api/pets'
import { getFoodsByIds, getFoodSafetyAllSpecies } from '../api/foods'
import { getEmergencyGuide } from '../api/emergency'
import { SPECIES, getSpeciesLabel } from '../constants/species'
import { RISK_CONFIG } from '../components/RiskBadge'
import PetPicker from '../components/search/PetPicker'
import FoodAutocomplete from '../components/search/FoodAutocomplete'
import Spinner from '../components/Spinner'
import ErrorMessage from '../components/ErrorMessage'
import { resolveEntry } from '../utils/foodSafety'
import { ELAPSED_OPTIONS, getElapsedLabel, getEmergencyAdvice } from '../utils/emergencyAdvice'
import { getApiErrorMessage } from '../utils/apiError'
import NearbyClinics from '../components/emergency/NearbyClinics'
import FoodThumb from '../components/FoodThumb'

const STEPS = ['animal', 'food', 'time']
const STEP_TITLES = {
    animal: '¿Quién comió algo?',
    food: '¿Qué comió?',
    time: '¿Hace cuánto tiempo?',
}

const TONE_STYLES = {
    safe: 'bg-green-50 border-green-100 text-risk-safe',
    moderate: 'bg-amber-50 border-amber-100 text-risk-moderate',
    urgent: 'bg-red-50 border-red-200 text-risk-toxic',
    unknown: 'bg-red-50 border-red-200 text-risk-toxic',
}

const OPTION =
    'w-full min-h-[52px] px-4 flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white text-left text-sm font-medium text-gray-900 hover:bg-bone focus:outline-none focus-visible:ring-2 focus-visible:ring-brand'

const describeAnimal = (animal) => (animal.name ? animal.name : `Tu ${getSpeciesLabel(animal.species).toLowerCase()}`)

function StepHeader({ step, onBack }) {
    const index = STEPS.indexOf(step)
    return (
        <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
                {onBack ? (
                    <button
                        type="button"
                        onClick={onBack}
                        className="inline-flex items-center gap-1 min-h-[44px] text-sm font-medium text-brand"
                    >
                        <ArrowLeft size={16} aria-hidden="true" />
                        Atrás
                    </button>
                ) : (
                    <span />
                )}
                <span className="font-mono text-xs uppercase tracking-wide text-gray-500">
                    Paso {index + 1} de {STEPS.length}
                </span>
            </div>
            <div className="flex gap-1.5 mb-4" aria-hidden="true">
                {STEPS.map((s, i) => (
                    <span key={s} className={`h-1 flex-1 rounded-full ${i <= index ? 'bg-risk-toxic' : 'bg-gray-200'}`} />
                ))}
            </div>
            <h2 className="text-xl font-semibold text-gray-900">{STEP_TITLES[step]}</h2>
        </div>
    )
}

function AnimalStep({ pets, onChoose }) {
    const [otherOpen, setOtherOpen] = useState(pets.length === 0)
    return (
        <div className="space-y-5">
            {pets.length > 0 && (
                <PetPicker
                    pets={pets}
                    selectedPetId={null}
                    label="Tus mascotas"
                    showAddPet={false}
                    onSelect={(id) => {
                        const pet = pets.find((p) => p.id === id)
                        onChoose({ petId: pet.id, name: pet.name, species: pet.species, lifeStage: pet.lifeStage })
                    }}
                />
            )}
            {pets.length > 0 && !otherOpen && (
                <button type="button" onClick={() => setOtherOpen(true)} className="min-h-[44px] text-sm font-medium text-brand">
                    Es otro animal ›
                </button>
            )}
            {otherOpen && (
                <div>
                    <p id="emergency-species-label" className="font-mono text-xs uppercase tracking-wide text-gray-500 mb-2">
                        Especie
                    </p>
                    <div role="group" aria-labelledby="emergency-species-label" className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {SPECIES.map((s) => (
                            <button
                                key={s.value}
                                type="button"
                                onClick={() => onChoose({ species: s.value, lifeStage: null })}
                                className="min-h-[48px] px-3 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-900 hover:bg-bone"
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

function FoodStep({ onChoose }) {
    const [query, setQuery] = useState('')
    return (
        <div className="space-y-4">
            <FoodAutocomplete
                id="emergency-food"
                label="Alimento"
                query={query}
                onQueryChange={setQuery}
                onSelect={(food) => onChoose(food)}
            />
            <button
                type="button"
                onClick={() => onChoose({ id: null, name: null })}
                className="inline-flex items-center gap-1.5 min-h-[44px] text-sm font-medium text-brand"
            >
                <HelpCircle size={16} aria-hidden="true" />
                No sé qué comió
            </button>
        </div>
    )
}

function TimeStep({ onChoose }) {
    return (
        <div className="space-y-2">
            {ELAPSED_OPTIONS.map((option) => (
                <button key={option.value} type="button" onClick={() => onChoose(option.value)} className={OPTION}>
                    {option.label}
                    <Clock size={16} className="text-gray-400" aria-hidden="true" />
                </button>
            ))}
        </div>
    )
}

function EmergencyResult({ animal, food, elapsed, onRestart }) {
    const [state, setState] = useState({ loading: true, error: null, entry: null, guide: null })
    const [attempt, setAttempt] = useState(0)

    useEffect(() => {
        let active = true
        const load = async () => {
            setState({ loading: true, error: null, entry: null, guide: null })
            try {
                const entries = food.id ? (await getFoodSafetyAllSpecies(food.id)).data : []
                const { entry } = resolveEntry(entries, animal.species, animal.lifeStage || null)
                const { guideLevel } = getEmergencyAdvice(entry?.riskLevel ?? null, elapsed)
                let guide = null
                if (guideLevel) {
                    try {
                        guide = (await getEmergencyGuide(guideLevel)).data
                    } catch (err) {
                        if (err.response?.status !== 404) throw err
                    }
                }
                if (active) setState({ loading: false, error: null, entry, guide })
            } catch (err) {
                if (active) setState({ loading: false, error: err, entry: null, guide: null })
            }
        }
        load()
        return () => {
            active = false
        }
    }, [animal, food, elapsed, attempt])

    if (state.loading) return <Spinner label="Preparando las indicaciones..." />
    if (state.error) {
        return (
            <ErrorMessage
                message={getApiErrorMessage(state.error, { fallback: 'No se pudieron cargar las indicaciones.' })}
                onRetry={() => setAttempt((n) => n + 1)}
            />
        )
    }

    const riskLevel = state.entry?.riskLevel ?? null
    const advice = getEmergencyAdvice(riskLevel, elapsed)
    const config = riskLevel ? RISK_CONFIG[riskLevel] : null
    const who = describeAnimal(animal)
    const what = food.name ? food.name.toLowerCase() : 'algo que no sabes qué es'
    const when = elapsed === 'UNKNOWN' ? 'sin saber cuándo' : `hace ${getElapsedLabel(elapsed)}`
    const needsClinic = advice.tone === 'urgent' || advice.tone === 'unknown'

    return (
        <section aria-label="Indicaciones de emergencia" className="space-y-4">
            <div className={`border rounded-lg p-5 ${TONE_STYLES[advice.tone]}`}>
                <div className="flex items-center gap-3">
                    {food.name && <FoodThumb name={food.name} category={food.category} size="md" />}
                    <p className="text-sm">
                        <strong>{who}</strong> comió <strong>{what}</strong> {when}.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 mt-2">
                    {config && <config.Icon size={26} aria-hidden="true" />}
                    <h2 className="text-2xl font-bold">{advice.title}</h2>
                    {config && (
                        <span className={`font-mono text-xs font-semibold px-2 py-0.5 rounded border bg-white ${config.border}`}>
                            {config.label}
                        </span>
                    )}
                </div>
                <p className="text-sm text-gray-800 mt-3 leading-relaxed">{advice.message}</p>
                {state.entry && state.entry.verifiedStatus !== 'VERIFIED' && (
                    <p className="text-xs text-gray-600 mt-2">
                        Esta evaluación todavía no la revisa un veterinario. Tómala como orientación.
                    </p>
                )}
            </div>
            {needsClinic && <NearbyClinics />}
            {state.guide && (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-5 border-b border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                            <ListChecks size={16} className="text-gray-500" aria-hidden="true" />
                            <p className="font-mono text-xs uppercase tracking-wide text-gray-500">
                                {riskLevel ? 'Qué hacer' : 'Qué hacer mientras tanto'}
                            </p>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-line">{state.guide.steps}</p>
                    </div>
                    {state.guide.emergencyContactsInfo && (
                        <div className="p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <Phone size={16} className="text-gray-500" aria-hidden="true" />
                                <p className="font-mono text-xs uppercase tracking-wide text-gray-500">
                                    Contactos de emergencia
                                </p>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-line">{state.guide.emergencyContactsInfo}</p>
                        </div>
                    )}
                </div>
            )}

            {state.entry?.notes && (
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <p className="font-mono text-xs uppercase tracking-wide text-gray-500 mb-2">Sobre este alimento</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{state.entry.notes}</p>
                </div>
            )}

            {advice.tone === 'moderate' && <NearbyClinics />}

            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={onRestart}
                    className="inline-flex items-center gap-2 min-h-[44px] px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white"
                >
                    <RotateCcw size={16} aria-hidden="true" />
                    Empezar de nuevo
                </button>
                {advice.guideLevel && (
                    <Link
                        to={`/emergency/${advice.guideLevel}`}
                        className="inline-flex items-center min-h-[44px] px-4 text-sm font-medium text-brand"
                    >
                        Ver todas las guías
                    </Link>
                )}
            </div>
        </section>
    )
}

function EmergencyFlowPage() {
    const [searchParams] = useSearchParams()
    const [pets, setPets] = useState([])
    const [loading, setLoading] = useState(true)
    const [animal, setAnimal] = useState(null)
    const [food, setFood] = useState(null)
    const [elapsed, setElapsed] = useState(null)

    useEffect(() => {
        const petId = searchParams.get('petId')
        const species = searchParams.get('species')
        const lifeStage = searchParams.get('lifeStage')
        const foodId = Number(searchParams.get('foodId'))
        const init = async () => {
            const [petsRes, foodsRes] = await Promise.allSettled([
                getMyPets(),
                foodId ? getFoodsByIds([foodId]) : Promise.resolve({ data: [] }),
            ])
            const loadedPets = petsRes.status === 'fulfilled' ? petsRes.value.data : []
            setPets(loadedPets)
            const pet = loadedPets.find((p) => String(p.id) === petId)
            if (pet) setAnimal({ petId: pet.id, name: pet.name, species: pet.species, lifeStage: pet.lifeStage })
            else if (SPECIES.some((s) => s.value === species)) setAnimal({ species, lifeStage: lifeStage || null })
            const preselected = foodsRes.status === 'fulfilled' ? foodsRes.value.data[0] : null
            if (preselected) setFood(preselected)
            setLoading(false)
        }
        init()
    }, [searchParams])

    const step = !animal ? 'animal' : !food ? 'food' : !elapsed ? 'time' : 'result'

    const back = () => {
        if (step === 'time') setFood(null)
        else if (step === 'food') setAnimal(null)
    }

    const restart = () => {
        setAnimal(null)
        setFood(null)
        setElapsed(null)
    }

    return (
        <div className="max-w-2xl">
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Mi mascota comió algo</h1>
            <p className="text-sm text-gray-500 mb-6">Tres preguntas y te decimos qué hacer ahora.</p>

            {loading ? (
                <Spinner />
            ) : step === 'result' ? (
                <EmergencyResult animal={animal} food={food} elapsed={elapsed} onRestart={restart} />
            ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
                    <StepHeader step={step} onBack={step === 'animal' ? null : back} />
                    {step === 'animal' && <AnimalStep pets={pets} onChoose={setAnimal} />}
                    {step === 'food' && <FoodStep onChoose={setFood} />}
                    {step === 'time' && <TimeStep onChoose={setElapsed} />}
                </div>
            )}

            <p className="text-xs text-gray-400 mt-6 text-center">
                CanMyPet? ofrece orientación informativa y no sustituye una consulta veterinaria.
            </p>
        </div>
    )
}

export default EmergencyFlowPage