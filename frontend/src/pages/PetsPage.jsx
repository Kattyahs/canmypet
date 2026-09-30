import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Search, PawPrint } from 'lucide-react'
import { getMyPets, createPet, updatePet } from '../api/pets'
import { SPECIES, getSpeciesLabel, getStageHints } from '../constants/species'
import { LIFE_STAGE_LABELS, getLifeStageLabel } from '../constants/lifeStages'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import ErrorMessage from '../components/ErrorMessage'
import { getApiErrorMessage } from '../utils/apiError'

const buildLifeStages = (species) => {
    const hints = getStageHints(species)
    return Object.entries(LIFE_STAGE_LABELS).map(([value, label]) => ({ value, label, hint: hints[value] }))
}

const EMPTY_FORM = {
    name: '',
    species: '',
    breed: '',
    weight: '',
    birthDate: '',
    lifeStage: '',
    medicalConditions: '',
}

const LABEL = 'block font-mono text-xs uppercase tracking-wide text-gray-500 mb-1.5'
const INPUT =
    'w-full min-h-[44px] px-3 border border-gray-300 rounded-md text-base md:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand'

function PetsPage() {
    const [pets, setPets] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState('')
    const [editingId, setEditingId] = useState(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const formRef = useRef(null)

    const loadPets = useCallback(async () => {
        setLoading(true)
        setLoadError('')
        try {
            const response = await getMyPets()
            setPets(response.data)
        } catch (err) {
            setLoadError(getApiErrorMessage(err, { fallback: 'No se pudieron cargar tus mascotas.' }))
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadPets()
    }, [loadPets])

    useEffect(() => {
        if (editingId) formRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
    }, [editingId])

    const startCreate = () => {
        setEditingId('new')
        setForm(EMPTY_FORM)
        setError('')
    }

    const startEdit = (pet) => {
        setEditingId(pet.id)
        setForm({
            name: pet.name || '',
            species: pet.species || '',
            breed: pet.breed || '',
            weight: pet.weight ?? '',
            birthDate: pet.birthDate || '',
            lifeStage: pet.lifeStage || '',
            medicalConditions: pet.medicalConditions || '',
        })
        setError('')
    }

    const cancelEdit = () => {
        setEditingId(null)
        setForm(EMPTY_FORM)
        setError('')
    }

    const handleChange = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        setError('')
        try {
            const payload = {
                ...form,
                weight: form.weight ? Number(form.weight) : null,
                lifeStage: form.lifeStage || null,
            }

            if (editingId === 'new') {
                await createPet(payload)
            } else {
                await updatePet(editingId, payload)
            }

            await loadPets()
            cancelEdit()
        } catch (err) {
            setError(
                getApiErrorMessage(err, {
                    fallback: 'No se pudo guardar la mascota.',
                    byStatus: { 400: 'Revisa los datos de la mascota.' },
                })
            )
        } finally {
            setSaving(false)
        }
    }

    return (
        <div>
            <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Mis mascotas</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        La etapa de vida ajusta los niveles de riesgo de cada alimento.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={startCreate}
                    className="flex items-center gap-2 min-h-[44px] px-4 bg-brand text-white text-sm font-medium rounded-md"
                >
                    <Plus size={16} aria-hidden="true" />
                    Nueva mascota
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                    {loading && <Spinner label="Cargando tus mascotas..." />}

                    {!loading && loadError && <ErrorMessage message={loadError} onRetry={loadPets} />}

                    {!loading && !loadError && pets.length === 0 && (
                        <EmptyState
                            icon={PawPrint}
                            title="Aún no tienes mascotas registradas"
                            description="Registra tu mascota para ver el riesgo de cada alimento según su especie y etapa de vida."
                        />
                    )}

                    {pets.map((pet) => (
                        <div
                            key={pet.id}
                            className={`bg-white border rounded-lg p-4 ${
                                editingId === pet.id ? 'border-brand ring-1 ring-brand' : 'border-gray-200'
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-gray-900">{pet.name}</p>
                                {pet.lifeStage && (
                                    <span className="text-xs font-mono uppercase px-1.5 py-0.5 bg-bone rounded text-gray-600">
                                        {getLifeStageLabel(pet.lifeStage)}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mb-2">
                                {getSpeciesLabel(pet.species)}
                                {pet.breed ? ` · ${pet.breed}` : ''}
                                {pet.weight ? ` · ${pet.weight} kg` : ''}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-4 text-sm">
                                <button
                                    type="button"
                                    onClick={() => startEdit(pet)}
                                    className="flex items-center gap-1 min-h-[44px] text-brand font-medium"
                                >
                                    <Pencil size={14} aria-hidden="true" />
                                    Editar
                                </button>
                                <Link
                                    to={`/search?petId=${pet.id}`}
                                    className="flex items-center gap-1 min-h-[44px] text-brand font-medium"
                                >
                                    <Search size={14} aria-hidden="true" />
                                    Consultar un alimento
                                </Link>
                            </div>
                        </div>
                    ))}

                    <p className="text-xs text-gray-400 pt-2">Puedes registrar hasta 5 mascotas.</p>
                </div>

                {editingId && (
                    <div ref={formRef} className="bg-white border border-gray-200 rounded-lg p-5 h-fit scroll-mt-20">
                        <p className="font-mono text-xs uppercase tracking-wide text-brand mb-1">
                            {editingId === 'new' ? 'Nueva mascota' : 'Editando'}
                        </p>
                        {editingId !== 'new' && (
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">{form.name}</h2>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4 mt-3">
                            <div>
                                <label htmlFor="pet-name" className={LABEL}>
                                    Nombre
                                </label>
                                <input
                                    id="pet-name"
                                    type="text"
                                    value={form.name}
                                    onChange={handleChange('name')}
                                    required
                                    className={INPUT}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="pet-species" className={LABEL}>
                                        Especie
                                    </label>
                                    <select
                                        id="pet-species"
                                        value={form.species}
                                        onChange={handleChange('species')}
                                        required
                                        className={INPUT}
                                    >
                                        <option value="">Selecciona una especie</option>
                                        {SPECIES.map((s) => (
                                            <option key={s.value} value={s.value}>{s.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="pet-breed" className={LABEL}>
                                        Raza
                                    </label>
                                    <input
                                        id="pet-breed"
                                        type="text"
                                        value={form.breed}
                                        onChange={handleChange('breed')}
                                        className={INPUT}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="pet-weight" className={LABEL}>
                                        Peso (kg)
                                    </label>
                                    <input
                                        id="pet-weight"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={form.weight}
                                        onChange={handleChange('weight')}
                                        className={INPUT}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="pet-birth-date" className={LABEL}>
                                        Fecha de nacimiento
                                    </label>
                                    <input
                                        id="pet-birth-date"
                                        type="date"
                                        value={form.birthDate}
                                        onChange={handleChange('birthDate')}
                                        max={new Date().toISOString().split('T')[0]}
                                        className={INPUT}
                                    />
                                </div>
                            </div>

                            <fieldset>
                                <legend className={LABEL}>Etapa de vida</legend>
                                <div className="grid grid-cols-3 gap-2">
                                    {buildLifeStages(form.species).map((stage) => (
                                        <button
                                            key={stage.value}
                                            type="button"
                                            aria-pressed={form.lifeStage === stage.value}
                                            onClick={() =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    lifeStage: prev.lifeStage === stage.value ? '' : stage.value,
                                                }))
                                            }
                                            className={`min-h-[44px] px-2 py-2 rounded-md border text-center ${
                                                form.lifeStage === stage.value
                                                    ? 'border-brand ring-1 ring-brand bg-bone'
                                                    : 'border-gray-200'
                                            }`}
                                        >
                                            <span className="block text-sm font-medium text-gray-900">{stage.label}</span>
                                            <span className="block text-xs text-gray-500">{stage.hint}</span>
                                        </button>
                                    ))}
                                </div>
                            </fieldset>

                            <div>
                                <label htmlFor="pet-medical-conditions" className={LABEL}>
                                    Condiciones médicas
                                </label>
                                <input
                                    id="pet-medical-conditions"
                                    type="text"
                                    value={form.medicalConditions}
                                    onChange={handleChange('medicalConditions')}
                                    placeholder="Opcional"
                                    className={INPUT}
                                />
                            </div>

                            {error && (
                                <p role="alert" className="text-sm text-risk-toxic">
                                    {error}
                                </p>
                            )}

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 min-h-[44px] bg-brand text-white text-sm font-medium rounded-md disabled:opacity-60"
                                >
                                    {saving ? 'Guardando...' : 'Guardar cambios'}
                                </button>
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="min-h-[44px] px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    )
}

export default PetsPage