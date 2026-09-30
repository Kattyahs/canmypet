import { Link } from 'react-router-dom'
import { AlertTriangle, ExternalLink } from 'lucide-react'
import { RISK_CONFIG } from '../RiskBadge'
import { getSpeciesLabel } from '../../constants/species'
import { getLifeStageLabel } from '../../constants/lifeStages'
import { isSafeUrl } from '../../utils/foodSafety'
import FoodThumb from '../FoodThumb'

const HEADLINES = {
    SAFE: 'Sí, puede comerlo',
    MODERATE: 'Solo con precaución',
    TOXIC: 'No. Es tóxico',
    LETHAL: 'No. Es muy peligroso',
}

const LABEL = 'font-mono text-[11px] uppercase tracking-wide text-gray-500 mb-1'

function VerdictCard({ entry, question, stageNote, onShowOtherSpecies, emergencyHref, foodCategory }) {
    const config = RISK_CONFIG[entry.riskLevel]
    const Icon = config.Icon
    const pending = entry.verifiedStatus !== 'VERIFIED'
    const appliesTo = entry.lifeStage
        ? `${getSpeciesLabel(entry.species)} · ${getLifeStageLabel(entry.lifeStage)}`
        : `${getSpeciesLabel(entry.species)} · todas las etapas`

    return (
        <section aria-label="Resultado" className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className={`${config.bg} ${config.border} border-b px-5 py-5 md:px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4`}>
                <div className="flex items-start gap-4">
                    <FoodThumb name={entry.foodName} category={foodCategory} size="lg" className="hidden sm:inline-flex" />
                    <div className="flex flex-col gap-1.5">
                        <p className={`text-sm ${config.text}`}>{question}</p>
                        <div className={`flex flex-wrap items-center gap-2.5 ${config.text}`}>
                            <Icon size={28} aria-hidden="true" />
                            <h2 className="text-2xl md:text-[28px] font-bold">{HEADLINES[entry.riskLevel]}</h2>
                            <span className={`font-mono text-xs font-semibold px-2 py-0.5 rounded border ${config.border} bg-white`}>
                                {config.label}
                            </span>
                        </div>
                        <p className={`text-sm ${config.text}`}>{config.verdict}</p>
                    </div>
                </div>
                {entry.riskLevel !== 'SAFE' && (
                    <Link
                        to={emergencyHref ?? `/emergency/${entry.riskLevel}`}
                        className="shrink-0 inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-md bg-risk-toxic text-white text-sm font-semibold"
                    >
                        <AlertTriangle size={16} aria-hidden="true" />
                        Ya lo comió: qué hacer
                    </Link>
                )}
            </div>

            <div className="px-5 py-5 md:px-6 grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-100">
                <div>
                    <p className={LABEL}>Aplica a</p>
                    <p className="text-sm text-gray-900">{appliesTo}</p>
                    {stageNote && <p className="text-xs text-gray-500 mt-1">{stageNote}</p>}
                </div>
                <div>
                    <p className={LABEL}>Estado</p>
                    {pending ? (
                        <>
                            <p className="text-sm text-risk-moderate">Sin revisar aún</p>
                            <p className="text-xs text-gray-500 mt-1">
                                Un veterinario todavía no validó esta evaluación. Tómala como orientación.
                            </p>
                        </>
                    ) : (
                        <p className="text-sm text-risk-safe">Verificado por un veterinario</p>
                    )}
                </div>
                <div>
                    <p className={LABEL}>Fuentes</p>
                    {entry.sources?.length > 0 ? (
                        <ul className="space-y-1">
                            {entry.sources.map((source) => (
                                <li key={source.id} className="text-sm">
                                    {isSafeUrl(source.sourceUrl) ? (

                                        <a  href={source.sourceUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-brand"
                                        >
                                            {source.sourceName}
                                            <ExternalLink size={12} aria-hidden="true" />
                                        </a>
                                    ) : (
                                        <span className="text-gray-700">{source.sourceName}</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500">Sin fuentes registradas</p>
                    )}
                </div>
            </div>

            <div className="px-5 py-5 md:px-6 flex flex-col gap-3">
                {entry.notes && <p className="text-sm leading-relaxed text-gray-700">{entry.notes}</p>}
                {onShowOtherSpecies && (
                    <button
                        type="button"
                        onClick={onShowOtherSpecies}
                        className="self-start min-h-[44px] text-sm font-medium text-brand"
                    >
                        Ver cómo afecta a otras especies ›
                    </button>
                )}
            </div>
        </section>
    )
}

export default VerdictCard