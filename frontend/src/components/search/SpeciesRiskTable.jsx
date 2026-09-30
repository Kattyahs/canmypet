import { getSpeciesLabel } from '../../constants/species'
import { getLifeStageLabel } from '../../constants/lifeStages'
import { sortBySeverity } from '../../utils/foodSafety'
import RiskBadge from '../RiskBadge'
import FoodThumb from '../FoodThumb'

function SpeciesRiskTable({ foodName, foodCategory, entries, onSelectEntry, caption }) {
    const rows = sortBySeverity(entries)
    const hasPending = rows.some((e) => e.verifiedStatus !== 'VERIFIED')

    return (
        <section aria-label={`Riesgo de ${foodName} por especie`} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-5 md:px-6 pt-5 pb-4 border-b border-gray-100 flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex items-center gap-3">
                    <FoodThumb name={foodName} category={foodCategory} size="md" />
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">{foodName}</h2>
                        <p className="text-sm text-gray-500 mt-1">{caption}</p>
                    </div>
                </div>
                <span className="text-xs text-gray-500">De mayor a menor riesgo</span>
            </div>

            <table className="w-full text-left">
                <thead className="bg-gray-50">
                <tr className="font-mono text-[11px] uppercase text-gray-500">
                    <th scope="col" className="px-5 md:px-6 py-2.5 font-medium">Especie</th>
                    <th scope="col" className="px-3 py-2.5 font-medium hidden md:table-cell">Aplica a</th>
                    <th scope="col" className="px-3 py-2.5 font-medium">Riesgo</th>
                    <th scope="col" className="px-3 py-2.5 font-medium">Estado</th>
                    <th scope="col" className="px-3 py-2.5"><span className="sr-only">Detalle</span></th>
                </tr>
                </thead>
                <tbody>
                {rows.map((entry) => {
                    const pending = entry.verifiedStatus !== 'VERIFIED'
                    const species = getSpeciesLabel(entry.species)
                    return (
                        <tr key={entry.id} className="border-t border-gray-100">
                            <td className="px-5 md:px-6 py-3 text-sm font-semibold text-gray-900">
                                {species}
                                {entry.lifeStage && (
                                    <span className="block md:hidden text-xs font-normal text-gray-500">
                                            {getLifeStageLabel(entry.lifeStage)}
                                        </span>
                                )}
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-600 hidden md:table-cell">
                                {getLifeStageLabel(entry.lifeStage)}
                            </td>
                            <td className="px-3 py-3">
                                <RiskBadge level={entry.riskLevel} />
                            </td>
                            <td className={`px-3 py-3 text-sm ${pending ? 'text-risk-moderate' : 'text-risk-safe'}`}>
                                {pending ? 'Sin revisar aún' : 'Verificado'}
                            </td>
                            <td className="px-3 py-1 text-right">
                                <button
                                    type="button"
                                    onClick={() => onSelectEntry(entry)}
                                    aria-label={`Ver detalle para ${species}${entry.lifeStage ? ` ${getLifeStageLabel(entry.lifeStage).toLowerCase()}` : ''}`}
                                    className="min-h-[44px] min-w-[44px] text-sm font-medium text-brand"
                                >
                                    Ver ›
                                </button>
                            </td>
                        </tr>
                    )
                })}
                </tbody>
            </table>

            {hasPending && (
                <p className="px-5 md:px-6 py-4 border-t border-gray-100 bg-gray-50/50 text-sm text-gray-600">
                    "Sin revisar aún" significa que un veterinario todavía no validó esa evaluación. Tómala como orientación.
                </p>
            )}
        </section>
    )
}

export default SpeciesRiskTable