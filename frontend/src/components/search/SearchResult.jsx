import { Link } from 'react-router-dom'
import { Soup } from 'lucide-react'
import { getSpeciesLabel } from '../../constants/species'
import { getLifeStageLabel } from '../../constants/lifeStages'
import { resolveEntry } from '../../utils/foodSafety'
import { getApiErrorMessage } from '../../utils/apiError'
import VerdictCard from './VerdictCard'
import SpeciesRiskTable from './SpeciesRiskTable'
import Spinner from '../Spinner'
import EmptyState from '../EmptyState'
import ErrorMessage from '../ErrorMessage'

const countSpecies = (entries) => new Set(entries.map((e) => e.species)).size

function SearchResult({
                          food,
                          lookup,
                          activeTab,
                          selectedPet,
                          generalSpecies,
                          generalStage,
                          onRetry,
                          onShowAllSpecies,
                          onPickEntry,
                      }) {
    if (lookup.loading) return <Spinner label={`Consultando ${food.name}...`} />

    if (lookup.error) {
        return (
            <ErrorMessage
                message={getApiErrorMessage(lookup.error, {
                    fallback: 'No se pudo consultar el riesgo de este alimento.',
                })}
                onRetry={onRetry}
            />
        )
    }

    if (lookup.entries.length === 0) {
        return (
            <EmptyState
                icon={Soup}
                title={`Todavía no hay información sobre ${food.name.toLowerCase()}`}
                description="Un veterinario aún no ha evaluado este alimento."
            >
                <Link to="/faq" className="text-sm font-medium text-brand">
                    Preguntar en el FAQ
                </Link>
            </EmptyState>
        )
    }

    const renderResolved = (species, lifeStage, question, emergencyParams) => {
        const { entry, usedGeneralForStage, speciesEntries } = resolveEntry(lookup.entries, species, lifeStage || null)
        const speciesLabel = getSpeciesLabel(species).toLowerCase()

        if (entry) {
            return (
                <VerdictCard
                    entry={entry}
                    question={question}
                    stageNote={
                        usedGeneralForStage
                            ? `No hay una evaluación específica para la etapa ${getLifeStageLabel(lifeStage).toLowerCase()}.`
                            : null
                    }
                    onShowOtherSpecies={onShowAllSpecies}
                    emergencyHref={`/emergency/start?${new URLSearchParams({ ...emergencyParams, foodId: food.id })}`}
                />
            )
        }

        if (speciesEntries.length > 0) {
            return (
                <SpeciesRiskTable
                    foodName={food.name}
                    entries={speciesEntries}
                    onSelectEntry={onPickEntry}
                    caption={`No hay una evaluación general para ${speciesLabel}; estas son las que existen por etapa.`}
                />
            )
        }

        return (
            <EmptyState
                icon={Soup}
                title={`No hay información de ${food.name.toLowerCase()} para ${speciesLabel}`}
                description="Puede que sí la haya para otras especies."
            >
                <button type="button" onClick={onShowAllSpecies} className="min-h-[44px] text-sm font-medium text-brand">
                    Ver otras especies ›
                </button>
            </EmptyState>
        )
    }

    if (activeTab === 'pets') {
        if (!selectedPet) {
            return <p className="text-sm text-gray-500">Elige una mascota para ver el resultado.</p>
        }
        return renderResolved(
            selectedPet.species,
            selectedPet.lifeStage,
            <>
                ¿Puede <strong>{selectedPet.name}</strong> comer <strong>{food.name.toLowerCase()}</strong>?
            </>,
            { petId: selectedPet.id }
        )
    }

    if (!generalSpecies) {
        const count = countSpecies(lookup.entries)
        return (
            <SpeciesRiskTable
                foodName={food.name}
                entries={lookup.entries}
                onSelectEntry={onPickEntry}
                caption={`Riesgo en ${count} ${count === 1 ? 'especie' : 'especies'} con información registrada`}
            />
        )
    }

    return renderResolved(
        generalSpecies,
        generalStage,
        <>
            <strong>{food.name}</strong> · {getSpeciesLabel(generalSpecies)}
            {generalStage ? ` · ${getLifeStageLabel(generalStage)}` : ''}
        </>,
        generalStage ? { species: generalSpecies, lifeStage: generalStage } : { species: generalSpecies }
    )
}

export default SearchResult