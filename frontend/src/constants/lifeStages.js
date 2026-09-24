export const LIFE_STAGE_LABELS = {
    PUPPY: 'Cachorro',
    ADULT: 'Adulto',
    SENIOR: 'Senior',
}

export const getLifeStageLabel = (value) =>
    value ? LIFE_STAGE_LABELS[value] || value : 'Todas las etapas'