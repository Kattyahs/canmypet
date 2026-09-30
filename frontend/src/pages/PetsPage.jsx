import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, PawPrint, Camera, Trash2 } from 'lucide-react'
import { getMyPets, createPet, updatePet, deletePet, uploadPetPhoto, deletePetPhoto } from '../api/pets'
import { SPECIES, getStageHints } from '../constants/species'
import { LIFE_STAGE_LABELS } from '../constants/lifeStages'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import ErrorMessage from '../components/ErrorMessage'
import PetAvatar from '../components/PetAvatar'
import PetCard from '../components/pets/PetCard'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import { getApiErrorMessage } from '../utils/apiError'
import { ACCEPTED_PHOTO_TYPES, resizeImage } from '../utils/resizeImage'

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

const NO_PHOTO_CHANGE = { file: null, previewUrl: null, remove: false }

const photoErrorMessage = (err) =>
    getApiErrorMessage(err, {
        fallback: 'No se pudo subir la foto.',
        byStatus: {
            400: 'La foto debe ser una imagen JPG o PNG válida.',
            413: 'La foto pesa demasiado. Prueba con una más liviana.',
        },
    })

const MAX_PETS = 5

const LABEL = 'block text-sm font-medium text-gray-700 mb-1.5'
const INPUT =
    'w-full min-h-[48px] px-4 border border-gray-200 rounded-xl text-base md:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent'

function PetsPage() {
    const [pets, setPets] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState('')
    const [editingId, setEditingId] = useState(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [photo, setPhoto] = useState(NO_PHOTO_CHANGE)
    const [photoError, setPhotoError] = useState('')
    const [deleting, setDeleting] = useState(null)
    const [deleteBusy, setDeleteBusy] = useState(false)
    const [deleteError, setDeleteError] = useState('')
    const nameInputRef = useRef(null)

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
        const url = photo.previewUrl
        return () => {
            if (url) URL.revokeObjectURL(url)
        }
    }, [photo.previewUrl])

    const resetPhoto = () => {
        setPhoto(NO_PHOTO_CHANGE)
        setPhotoError('')
    }

    const startCreate = () => {
        setEditingId('new')
        setForm(EMPTY_FORM)
        setError('')
        resetPhoto()
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
        resetPhoto()
    }

    const cancelEdit = () => {
        setEditingId(null)
        setForm(EMPTY_FORM)
        setError('')
        resetPhoto()
    }

    const handlePhotoChange = async (e) => {
        const file = e.target.files?.[0]
        e.target.value = ''
        if (!file) return
        setPhotoError('')
        if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) {
            setPhotoError('Elige una foto JPG o PNG.')
            return
        }
        try {
            const resized = await resizeImage(file)
            setPhoto({ file: resized, previewUrl: URL.createObjectURL(resized), remove: false })
        } catch {
            setPhotoError('No pudimos leer esa foto. Prueba con otra.')
        }
    }

    const removePhoto = () => {
        setPhoto({ file: null, previewUrl: null, remove: true })
        setPhotoError('')
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

            const saved = editingId === 'new' ? await createPet(payload) : await updatePet(editingId, payload)
            const petId = saved.data.id

            try {
                if (photo.file) await uploadPetPhoto(petId, photo.file)
                else if (photo.remove && saved.data.hasPhoto) await deletePetPhoto(petId)
            } catch (photoErr) {
                await loadPets()
                setEditingId(petId)
                setPhoto(NO_PHOTO_CHANGE)
                setPhotoError(`La mascota se guardó, pero la foto no. ${photoErrorMessage(photoErr)}`)
                return
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

    const askDelete = (pet) => {
        setDeleting(pet)
        setDeleteError('')
    }

    const closeDelete = () => {
        setDeleting(null)
        setDeleteError('')
    }

    const confirmDelete = async () => {
        setDeleteBusy(true)
        setDeleteError('')
        try {
            await deletePet(deleting.id)
            closeDelete()
            await loadPets()
        } catch (err) {
            setDeleteError(getApiErrorMessage(err, { fallback: 'No se pudo eliminar la mascota.' }))
        } finally {
            setDeleteBusy(false)
        }
    }

    const editingPet = pets.find((p) => p.id === editingId)
    const canAddPet = pets.length < MAX_PETS
    const currentHasPhoto = Boolean(photo.previewUrl) || (!photo.remove && Boolean(editingPet?.hasPhoto))

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Mis mascotas</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Sus perfiles, siempre a mano. La etapa de vida ajusta el riesgo de cada alimento.
                    </p>
                </div>
                <Button onClick={startCreate} disabled={!canAddPet}>
                    <Plus size={16} aria-hidden="true" />
                    Nueva mascota
                </Button>
            </div>

            {loading && <Spinner label="Cargando tus mascotas..." />}

            {!loading && loadError && <ErrorMessage message={loadError} onRetry={loadPets} />}

            {!loading && !loadError && pets.length === 0 && (
                <EmptyState
                    icon={PawPrint}
                    title="Aún no tienes mascotas registradas"
                    description="Registra tu mascota para ver el riesgo de cada alimento según su especie y etapa de vida."
                />
            )}

            {!loading && !loadError && pets.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {pets.map((pet) => (
                        <PetCard key={pet.id} pet={pet} onEdit={startEdit} onDelete={askDelete} />
                    ))}
                    {canAddPet && (
                        <button
                            type="button"
                            onClick={startCreate}
                            className="flex flex-col items-center justify-center gap-2 min-h-[280px] p-5 rounded-2xl border-2 border-dashed border-gray-200 text-center text-gray-500 hover:border-brand hover:bg-brand-muted hover:text-brand transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                        >
                            <span className="w-14 h-14 rounded-full bg-bone flex items-center justify-center">
                                <Plus size={26} aria-hidden="true" />
                            </span>
                            <span className="text-base font-semibold">Agregar mascota</span>
                            <span className="text-sm text-gray-500 max-w-[16rem]">
                                Guarda su información para consultas más personalizadas.
                            </span>
                        </button>
                    )}
                </div>
            )}

            {!loading && !loadError && (
                <p className="text-xs text-gray-400">Puedes registrar hasta {MAX_PETS} mascotas.</p>
            )}

            <Modal
                open={Boolean(editingId)}
                title={editingId === 'new' ? 'Nueva mascota' : `Editar perfil de ${editingPet?.name ?? ''}`}
                onClose={cancelEdit}
                dismissible={!saving}
                initialFocusRef={nameInputRef}
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="flex items-center gap-4">
                        <span className="block rounded-full p-1 ring-1 ring-gray-100">
                            <PetAvatar pet={photo.remove ? null : editingPet} size="lg" previewUrl={photo.previewUrl} />
                        </span>
                        <div className="flex flex-col items-start gap-1">
                            <label className="inline-flex items-center gap-2 min-h-[44px] px-4 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white cursor-pointer hover:bg-bone focus-within:ring-2 focus-within:ring-brand">
                                <Camera size={16} aria-hidden="true" />
                                {currentHasPhoto ? 'Cambiar foto' : 'Agregar foto'}
                                <input
                                    type="file"
                                    accept={ACCEPTED_PHOTO_TYPES.join(',')}
                                    onChange={handlePhotoChange}
                                    className="sr-only"
                                />
                            </label>
                            {currentHasPhoto && (
                                <button
                                    type="button"
                                    onClick={removePhoto}
                                    className="inline-flex items-center gap-1.5 min-h-[36px] px-1 text-sm text-gray-600 hover:text-risk-toxic"
                                >
                                    <Trash2 size={14} aria-hidden="true" />
                                    Quitar foto
                                </button>
                            )}
                        </div>
                    </div>
                    {photoError && (
                        <p role="alert" className="text-sm text-risk-toxic">
                            {photoError}
                        </p>
                    )}

                    <div>
                        <label htmlFor="pet-name" className={LABEL}>
                            Nombre
                        </label>
                        <input
                            ref={nameInputRef}
                            id="pet-name"
                            type="text"
                            value={form.name}
                            onChange={handleChange('name')}
                            required
                            className={INPUT}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                    <option key={s.value} value={s.value}>
                                        {s.label}
                                    </option>
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
                                placeholder="Opcional"
                                className={INPUT}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            {buildLifeStages(form.species).map((stage) => {
                                const selected = form.lifeStage === stage.value
                                return (
                                    <button
                                        key={stage.value}
                                        type="button"
                                        aria-pressed={selected}
                                        onClick={() =>
                                            setForm((prev) => ({
                                                ...prev,
                                                lifeStage: prev.lifeStage === stage.value ? '' : stage.value,
                                            }))
                                        }
                                        className={`min-h-[56px] px-2 py-2 rounded-xl border text-center transition-colors ${
                                            selected ? 'border-brand bg-brand-soft' : 'border-gray-200 hover:bg-bone'
                                        }`}
                                    >
                                        <span className={`block text-sm font-semibold ${selected ? 'text-brand' : 'text-gray-900'}`}>
                                            {stage.label}
                                        </span>
                                        <span className="block text-xs text-gray-500">{stage.hint}</span>
                                    </button>
                                )
                            })}
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

                    <div className="flex gap-2 pt-1">
                        <Button type="submit" disabled={saving} className="flex-1">
                            {saving ? 'Guardando...' : 'Guardar cambios'}
                        </Button>
                        <Button variant="secondary" onClick={cancelEdit} disabled={saving}>
                            Cancelar
                        </Button>
                    </div>
                </form>
            </Modal>

            <Modal
                open={Boolean(deleting)}
                title={`¿Eliminar a ${deleting?.name ?? ''}?`}
                onClose={closeDelete}
                dismissible={!deleteBusy}
                size="sm"
            >
                <p className="text-sm text-gray-600">
                    Se borrarán su perfil y su foto. Tus consultas anteriores se conservan en el historial, pero ya no
                    aparecerán asociadas a esta mascota.
                </p>
                {deleteError && (
                    <p role="alert" className="mt-3 text-sm text-risk-toxic">
                        {deleteError}
                    </p>
                )}
                <div className="flex gap-2 mt-5">
                    <Button variant="danger" onClick={confirmDelete} disabled={deleteBusy} className="flex-1">
                        <Trash2 size={16} aria-hidden="true" />
                        {deleteBusy ? 'Eliminando...' : 'Eliminar'}
                    </Button>
                    <Button variant="secondary" onClick={closeDelete} disabled={deleteBusy}>
                        Cancelar
                    </Button>
                </div>
            </Modal>
        </div>
    )
}

export default PetsPage