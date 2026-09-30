import { Link } from 'react-router-dom'
import { Check, Plus } from 'lucide-react'
import { getSpeciesLabel } from '../../constants/species'
import { LIFE_STAGE_LABELS } from '../../constants/lifeStages'
import PetAvatar from '../PetAvatar'

const TILE =
    'flex flex-col items-center gap-1 w-24 px-1 py-2 rounded-2xl text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand'

function PetPicker({ pets, selectedPetId, onSelect, label = '¿Para cuál de tus mascotas?', showAddPet = true }) {
    return (
        <div className="flex flex-col gap-3">
            <p id="pet-picker-label" className="text-sm font-medium text-gray-700">
                {label}
            </p>
            <div role="group" aria-labelledby="pet-picker-label" className="flex flex-wrap gap-2 sm:gap-4">
                {pets.map((pet) => {
                    const selected = String(pet.id) === String(selectedPetId)
                    return (
                        <button
                            key={pet.id}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => onSelect(pet.id)}
                            className={`${TILE} ${selected ? 'bg-brand-muted' : 'hover:bg-bone'}`}
                        >
                            <span className="relative">
                                <span
                                    className={`block rounded-full p-1 ${selected ? 'ring-2 ring-brand' : 'ring-1 ring-gray-200'}`}
                                >
                                    <PetAvatar pet={pet} size="picker" />
                                </span>
                                {selected && (
                                    <span className="absolute top-0 right-0 w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center ring-2 ring-white">
                                        <Check size={14} strokeWidth={3} aria-hidden="true" />
                                    </span>
                                )}
                            </span>
                            <span
                                className={`block max-w-full truncate text-sm font-semibold ${selected ? 'text-brand' : 'text-gray-900'}`}
                            >
                                {pet.name}
                            </span>
                            <span className="block text-xs leading-tight text-gray-500">
                                {getSpeciesLabel(pet.species)}
                                {pet.lifeStage ? ` · ${LIFE_STAGE_LABELS[pet.lifeStage]}` : ''}
                            </span>
                        </button>
                    )
                })}
                {showAddPet && (
                    <Link to="/pets" aria-label="Agregar mascota" className={`${TILE} text-gray-500 hover:bg-bone hover:text-brand`}>
                        <span className="block p-1">
                            <span className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                                <Plus size={24} aria-hidden="true" />
                            </span>
                        </span>
                        <span className="text-sm font-medium">Agregar</span>
                    </Link>
                )}
            </div>
        </div>
    )
}

export default PetPicker