import { Link } from 'react-router-dom'
import { AlertTriangle, BookOpen, ChevronRight, ExternalLink, ShieldAlert, ShieldCheck, Stethoscope } from 'lucide-react'
import { RISK_CONFIG } from '../RiskBadge'
import { getSpeciesLabel } from '../../constants/species'
import { getLifeStageLabel } from '../../constants/lifeStages'
import { isSafeUrl } from '../../utils/foodSafety'
import FoodThumb from '../FoodThumb'
import Card from '../ui/Card'

const HEADLINES = {
    SAFE: 'Sí, puede comerlo',
    MODERATE: 'Solo con precaución',
    TOXIC: 'No. Es tóxico',
    LETHAL: 'No. Es muy peligroso',
}

const CARD_TITLE = 'flex items-center gap-2 text-base font-semibold text-gray-900 mb-3'

function VerdictCard({ entry, question, stageNote, onShowOtherSpecies, emergencyHref, foodCategory }) {
    const config = RISK_CONFIG[entry.riskLevel]
    const Icon = config.Icon
    const pending = entry.verifiedStatus !== 'VERIFIED'
    const appliesTo = entry.lifeStage
        ? `${getSpeciesLabel(entry.species)} · ${getLifeStageLabel(entry.lifeStage)}`
        : `${getSpeciesLabel(entry.species)} · todas las etapas`

    return (
        <section aria-label="Resultado" className="flex flex-col gap-4">
            <div className={`relative rounded-2xl border ${config.bg} ${config.border} p-5 md:p-6`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:gap-6">
                    <div className="flex items-start justify-between gap-3 sm:contents">
                        <FoodThumb name={entry.foodName} category={foodCategory} size="xl" className="sm:self-center" />
                        <span
                            className={`sm:absolute sm:top-5 sm:right-5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border ${config.border} ${config.text} text-xs font-semibold tracking-wide`}
                        >
                            <Icon size={14} aria-hidden="true" />
                            {config.label}
                        </span>
                    </div>
                    <div className="flex flex-col gap-2 min-w-0">
                        <p className={`text-sm sm:pr-28 ${config.text}`}>{question}</p>
                        <div className={`flex items-center gap-3 ${config.text}`}>
                            <span className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white flex items-center justify-center">
                                <Icon size={26} aria-hidden="true" />
                            </span>
                            <h2 className="text-2xl md:text-3xl font-bold leading-tight">{HEADLINES[entry.riskLevel]}</h2>
                        </div>
                        <p className="text-sm text-gray-700">{config.verdict}</p>
                        <p className="flex items-center gap-1.5 text-xs text-gray-600">
                            {pending ? (
                                <>
                                    <ShieldAlert size={14} className="text-risk-moderate" aria-hidden="true" />
                                    <span className="font-medium text-risk-moderate">Sin revisar aún</span>
                                </>
                            ) : (
                                <>
                                    <ShieldCheck size={14} className="text-risk-safe" aria-hidden="true" />
                                    Verificado por un veterinario
                                </>
                            )}
                        </p>
                    </div>
                </div>

                {entry.riskLevel !== 'SAFE' && (
                    <Link
                        to={emergencyHref ?? `/emergency/${entry.riskLevel}`}
                        className="mt-5 inline-flex w-full sm:w-auto items-center justify-center gap-2 min-h-[48px] px-5 rounded-xl bg-risk-toxic text-white text-sm font-semibold hover:opacity-90"
                    >
                        <AlertTriangle size={16} aria-hidden="true" />
                        Ya lo comió: qué hacer
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <h3 className={CARD_TITLE}>
                        <Stethoscope size={18} className="text-brand" aria-hidden="true" />
                        Recomendación del veterinario
                    </h3>
                    {entry.notes ? (
                        <p className="text-sm leading-relaxed text-gray-700">{entry.notes}</p>
                    ) : (
                        <p className="text-sm text-gray-500">Sin indicaciones adicionales para este alimento.</p>
                    )}
                    <p className="mt-4 text-xs text-gray-500">
                        Aplica a: <span className="font-medium text-gray-700">{appliesTo}</span>
                    </p>
                    {stageNote && <p className="mt-1 text-xs text-gray-500">{stageNote}</p>}
                    {pending && (
                        <p className="mt-3 text-xs text-gray-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                            Un veterinario todavía no validó esta evaluación. Tómala como orientación.
                        </p>
                    )}
                </Card>

                <Card>
                    <h3 className={CARD_TITLE}>
                        <BookOpen size={18} className="text-brand" aria-hidden="true" />
                        Fuentes
                    </h3>
                    {entry.sources?.length > 0 ? (
                        <ul className="flex flex-col gap-2">
                            {entry.sources.map((source) => (
                                <li key={source.id} className="text-sm">
                                    {isSafeUrl(source.sourceUrl) ? (
                                        <a
                                            href={source.sourceUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 min-h-[32px] font-medium text-brand hover:underline"
                                        >
                                            {source.sourceName}
                                            <ExternalLink size={13} aria-hidden="true" />
                                        </a>
                                    ) : (
                                        <span className="text-gray-700">{source.sourceName}</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500">Sin fuentes registradas.</p>
                    )}
                </Card>
            </div>

            {onShowOtherSpecies && (
                <button
                    type="button"
                    onClick={onShowOtherSpecies}
                    className="self-start inline-flex items-center gap-1 min-h-[44px] text-sm font-medium text-brand"
                >
                    Ver cómo afecta a otras especies
                    <ChevronRight size={16} aria-hidden="true" />
                </button>
            )}
        </section>
    )
}

export default VerdictCard