import { getSpeciesLabel } from '../constants/species'
import { getLifeStageLabel } from '../constants/lifeStages'

export const consultationKey = ({ foodId, petId, species, lifeStage }) =>
    petId ? `${foodId}:pet:${petId}` : `${foodId}:general:${species ?? ''}:${lifeStage ?? ''}`

export const describeTarget = ({ species, lifeStage }) => {
    if (!species) return 'Todas las especies'
    const speciesLabel = getSpeciesLabel(species)
    return lifeStage ? `${speciesLabel} · ${getLifeStageLabel(lifeStage)}` : speciesLabel
}

export const describeConsultation = (entry, pet) => {
    if (!pet) return describeTarget(entry)
    const target = entry.species ? entry : pet
    return `${pet.name} · ${describeTarget(target)}`
}