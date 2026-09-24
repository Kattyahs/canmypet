import EmergencyGuideCard from './EmergencyGuideCard'

const LEVELS = ['MODERATE', 'TOXIC', 'LETHAL']

function EmergencyGuidesTab() {
    return (
        <div className="space-y-4">
            <p className="text-sm text-gray-500">
                Cada guía se muestra en Emergencias según el nivel de riesgo. Escribe un paso por línea.
            </p>
            {LEVELS.map((level) => (
                <EmergencyGuideCard key={level} level={level} />
            ))}
        </div>
    )
}

export default EmergencyGuidesTab