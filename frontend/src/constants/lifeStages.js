export const LIFE_STAGE_LABELS = {
    PUPPY: 'Cachorro',
    ADULT: 'Adulto',
    SENIOR: 'Senior',
}

// A null lifeStage in FoodSafety means the entry applies to every stage.
export const getLifeStageLabel = (value) =>
    value ? LIFE_STAGE_LABELS[value] || value : 'Todas las etapas'