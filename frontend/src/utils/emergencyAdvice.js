export const ELAPSED_OPTIONS = [
    { value: 'UNDER_30_MIN', label: 'Menos de 30 minutos' },
    { value: 'UP_TO_2_H', label: 'Entre 30 minutos y 2 horas' },
    { value: 'UP_TO_6_H', label: 'Entre 2 y 6 horas' },
    { value: 'OVER_6_H', label: 'Más de 6 horas' },
    { value: 'UNKNOWN', label: 'No lo sé' },
]

export const getElapsedLabel = (value) =>
    ELAPSED_OPTIONS.find((option) => option.value === value)?.label.toLowerCase() ?? ''

const URGENT_BY_ELAPSED = {
    UNDER_30_MIN: 'Llamar pronto le da a tu veterinario más opciones de tratamiento. No esperes a ver síntomas.',
    UP_TO_2_H: 'Llama ahora aunque tu mascota se vea bien: los síntomas pueden tardar horas en aparecer.',
    UP_TO_6_H: 'En este rango suelen aparecer los primeros síntomas. Llama ahora y, si ya hay vómitos, temblores o decaimiento, ve directo a urgencias.',
    OVER_6_H: 'Aunque haya pasado tiempo, llama igual: algunas intoxicaciones dan síntomas tardíos o dañan órganos sin señales visibles al principio.',
    UNKNOWN: 'Llama ahora y cuéntale a tu veterinario que no sabes cuánto tiempo pasó.',
}

const MODERATE_BY_ELAPSED = {
    UNDER_30_MIN: 'Retira lo que quede y anota cuánto comió. Por lo general basta con observarla durante las próximas 24 horas.',
    UP_TO_2_H: 'Por lo general basta con observarla durante las próximas 24 horas. Ofrécele agua fresca.',
    UP_TO_6_H: 'Si hasta ahora no hay síntomas, sigue observándola hasta completar 24 horas.',
    OVER_6_H: 'Si hasta ahora no hay síntomas, es una buena señal. Sigue atento durante el resto del día.',
    UNKNOWN: 'Obsérvala durante las próximas 24 horas y anota cualquier cambio.',
}

const SYMPTOMS_CALL = 'Si aparece cualquier síntoma o tienes dudas, llama a tu veterinario.'

export function getEmergencyAdvice(riskLevel, elapsed) {
    switch (riskLevel) {
        case 'SAFE':
            return {
                tone: 'safe',
                title: 'No es tóxico',
                message: `No es peligroso para su especie. ${SYMPTOMS_CALL}`,
                guideLevel: null,
            }
        case 'MODERATE':
            return {
                tone: 'moderate',
                title: 'Observa a tu mascota',
                message: `${MODERATE_BY_ELAPSED[elapsed] ?? MODERATE_BY_ELAPSED.UNKNOWN} ${SYMPTOMS_CALL}`,
                guideLevel: 'MODERATE',
            }
        case 'TOXIC':
            return {
                tone: 'urgent',
                title: 'Llama a tu veterinario ahora',
                message: URGENT_BY_ELAPSED[elapsed] ?? URGENT_BY_ELAPSED.UNKNOWN,
                guideLevel: 'TOXIC',
            }
        case 'LETHAL':
            return {
                tone: 'urgent',
                title: 'Es una urgencia: ve a una clínica ahora',
                message: `Llama en el camino para avisar que vas. ${URGENT_BY_ELAPSED[elapsed] ?? URGENT_BY_ELAPSED.UNKNOWN}`,
                guideLevel: 'LETHAL',
            }
        default:
            return {
                tone: 'unknown',
                title: 'Por precaución, llama a tu veterinario',
                message:
                    'No tenemos una evaluación de este alimento para tu mascota. Cuéntale a tu veterinario qué comió, cuánto y hace cuánto tiempo.',
                guideLevel: 'TOXIC',
            }
    }
}