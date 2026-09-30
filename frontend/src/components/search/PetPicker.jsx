import { Link } from 'react-router-dom'
import { PawPrint, Plus } from 'lucide-react'
import { getSpeciesLabel } from '../../constants/species'
import { LIFE_STAGE_LABELS } from '../../constants/lifeStages'

function PetPicker({ pets, selectedPetId, onSelect, label = '¿Para cuál de tus mascotas?', showAddPet = true }) {
    return (
        <div className="flex flex-col gap-2">
            <p id="pet-picker-label" className="font-mono text-xs uppercase tracking-wide text-gray-500">
                {label}
            </p>
            <div role="group" aria-labelledby="pet-picker-label" className="flex flex-wrap gap-2">
                {pets.map((pet) => {
                    const selected = String(pet.id) === String(selectedPetId)
                    return (
                        <button
                            key={pet.id}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => onSelect(pet.id)}
                            className={`flex items-center gap-2.5 min-h-[48px] py-1.5 pl-1.5 pr-3.5 rounded-full text-left ${
                                selected
                                    ? 'border-2 border-brand bg-brand/10'
                                    : 'border border-gray-300 bg-white hover:bg-bone'
                            }`}
                        >
                            <span
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    selected ? 'bg-brand text-white' : 'bg-gray-100 text-gray-500'
                                }`}
                            >
                                <PawPrint size={16} aria-hidden="true" />
                            </span>
                            <span>
                                <span className={`block text-sm font-semibold ${selected ? 'text-brand' : 'text-gray-900'}`}>
                                    {pet.name}
                                </span>
                                <span className="block text-xs text-gray-500">
                                    {getSpeciesLabel(pet.species)}
                                    {pet.lifeStage ? ` · ${LIFE_STAGE_LABELS[pet.lifeStage]}` : ''}
                                </span>
                            </span>
                        </button>
                    )
                })}
                {showAddPet && (
                    <Link
                        to="/pets"
                        className="flex items-center gap-1.5 min-h-[48px] px-3.5 rounded-full border border-dashed border-gray-300 text-sm text-gray-600 hover:bg-bone"
                    >
                        <Plus size={16} aria-hidden="true" />
                        Agregar mascota
                    </Link>

                )}

            </div>
        </div>
    )
}

export default PetPicker