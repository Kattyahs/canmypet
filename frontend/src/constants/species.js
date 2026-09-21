export const SPECIES = [
    { value: 'DOG', label: 'Perro' },
    { value: 'CAT', label: 'Gato' },
    { value: 'RABBIT', label: 'Conejo' },
    { value: 'BIRD', label: 'Ave' },
    { value: 'HAMSTER', label: 'Hámster' },
    { value: 'GUINEA_PIG', label: 'Cuy' },
    { value: 'FERRET', label: 'Hurón' },
    { value: 'TURTLE', label: 'Tortuga' },
    { value: 'OTHER', label: 'Otro' },
]

export const getSpeciesLabel = (value) =>
    SPECIES.find((s) => s.value === value)?.label || value

const DEFAULT_STAGE_HINTS = {
    PUPPY: '0–1 año',
    ADULT: '1–7 años',
    SENIOR: '7+ años',
}

const STAGE_HINTS_BY_SPECIES = {
    DOG: DEFAULT_STAGE_HINTS,
    CAT: DEFAULT_STAGE_HINTS,
    RABBIT: { PUPPY: '0–6 meses', ADULT: '6 meses–5 años', SENIOR: '5+ años' },
    BIRD: { PUPPY: '0–1 año', ADULT: '1–5 años', SENIOR: '5+ años' },
    HAMSTER: { PUPPY: '0–3 meses', ADULT: '3 meses–1.5 años', SENIOR: '1.5+ años' },
    GUINEA_PIG: { PUPPY: '0–4 meses', ADULT: '4 meses–4 años', SENIOR: '4+ años' },
    FERRET: { PUPPY: '0–1 año', ADULT: '1–5 años', SENIOR: '5+ años' },
    TURTLE: { PUPPY: '0–3 años', ADULT: '3–20 años', SENIOR: '20+ años' },
    OTHER: DEFAULT_STAGE_HINTS,
}

export const getStageHints = (species) =>
    STAGE_HINTS_BY_SPECIES[species] || DEFAULT_STAGE_HINTS