import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Search } from 'lucide-react'
import { getMyPets, createPet, updatePet } from '../api/pets'
import {SPECIES, getSpeciesLabel, getStageHints} from '../constants/species'

const buildLifeStages = (species) => {
    const hints = getStageHints(species)
    return[
        { value: 'PUPPY', label: 'Puppy', hint: hints.PUPPY },
        { value: 'ADULT', label: 'Adult', hint: hints.ADULT },
        { value: 'SENIOR', label: 'Senior', hint: hints.SENIOR },
    ]
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

function PetsPage() {
    const [pets, setPets] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const loadPets = async () => {
        setLoading(true)
        try {
            const response = await getMyPets()
            setPets(response.data)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadPets()
    }, [])

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
            setError(err.response?.data?.error || 'No se pudo guardar la mascota.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div>
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Mis mascotas</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        La etapa de vida ajusta los niveles de riesgo de cada alimento.
                    </p>
                </div>
                <button
                    onClick={startCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-medium rounded-md"
                >
                    <Plus size={16} />
                    Nueva mascota
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Lista */}
                <div className="space-y-3">
                    {loading && <p className="text-sm text-gray-400">Cargando...</p>}

                    {!loading && pets.length === 0 && (
                        <p className="text-sm text-gray-400">Aún no tienes mascotas registradas.</p>
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
                    {pet.lifeStage}
                  </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mb-2">
                                {getSpeciesLabel(pet.species)}
                                {pet.breed ? ` · ${pet.breed}` : ''}
                                {pet.weight ? ` · ${pet.weight} kg` : ''}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                                <button
                                    onClick={() => startEdit(pet)}
                                    className="flex items-center gap-1 text-brand font-medium"
                                >
                                    <Pencil size={14} />
                                    Editar
                                </button>
                                <Link
                                    to={`/search?petId=${pet.id}`}
                                    className="flex items-center gap-1 text-gray-500"
                                >
                                    <Search size={14} />
                                    Buscar alimento
                                </Link>
                            </div>
                        </div>
                    ))}

                    <p className="text-xs text-gray-400 pt-2">Puedes registrar hasta 5 mascotas.</p>
                </div>

                {/* Formulario */}
                {editingId && (
                    <div className="bg-white border border-gray-200 rounded-lg p-5 h-fit">
                        <p className="font-mono text-xs uppercase tracking-wide text-brand mb-1">
                            {editingId === 'new' ? 'Nueva mascota' : 'Editando'}
                        </p>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            {editingId === 'new' ? '' : form.name}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block font-mono text-xs uppercase tracking-wide text-gray-500 mb-1.5">
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={handleChange('name')}
                                    required
                                    className="w-full min-h-[44px] px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>

                                    <div>
                                        <label className="block font-mono text-xs uppercase tracking-wide text-gray-500 mb-1.5">
                                            Especie
                                        </label>
                                        <select
                                            value={form.species}
                                            onChange={handleChange('species')}
                                            required
                                            className="w-full min-h-[44px] px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                                        >
                                            <option value="">Selecciona una especie</option>
                                            {SPECIES.map((s) => (
                                                <option key={s.value} value={s.value}>{s.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block font-mono text-xs uppercase tracking-wide text-gray-500 mb-1.5">
                                        Raza
                                    </label>
                                    <input
                                        type="text"
                                        value={form.breed}
                                        onChange={handleChange('breed')}
                                        className="w-full min-h-[44px] px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-mono text-xs uppercase tracking-wide text-gray-500 mb-1.5">
                                        Peso (kg)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={form.weight}
                                        onChange={handleChange('weight')}
                                        className="w-full min-h-[44px] px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                                    />
                                </div>
                                <div>
                                    <label className="block font-mono text-xs uppercase tracking-wide text-gray-500 mb-1.5">
                                        Fecha de nacimiento
                                    </label>
                                    <input
                                        type="date"
                                        value={form.birthDate}
                                        onChange={handleChange('birthDate')}
                                        max={new Date().toISOString().split('T')[0]}
                                        className="w-full min-h-[44px] px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-mono text-xs uppercase tracking-wide text-gray-500 mb-2">
                                    Etapa de vida
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {buildLifeStages(form.species).map((stage) => (
                                        <button
                                            key={stage.value}
                                            type="button"
                                            onClick={() =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    lifeStage: prev.lifeStage === stage.value ? '' : stage.value,
                                                }))
                                            }
                                            className={`px-2 py-2 rounded-md border text-center ${
                                                form.lifeStage === stage.value
                                                    ? 'border-brand ring-1 ring-brand bg-bone'
                                                    : 'border-gray-200'
                                            }`}
                                        >
                                            <p className="text-sm font-medium text-gray-900">{stage.label}</p>
                                            <p className="text-xs text-gray-500">{stage.hint}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block font-mono text-xs uppercase tracking-wide text-gray-500 mb-1.5">
                                    Condiciones médicas
                                </label>
                                <input
                                    type="text"
                                    value={form.medicalConditions}
                                    onChange={handleChange('medicalConditions')}
                                    placeholder="Opcional"
                                    className="w-full min-h-[44px] px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                                />
                            </div>

                            {error && <p className="text-sm text-risk-toxic">{error}</p>}

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