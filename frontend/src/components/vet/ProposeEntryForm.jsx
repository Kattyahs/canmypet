import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { getAllFoods, createFoodSafety } from '../../api/foods'
import { SPECIES } from '../../constants/species'
import { LIFE_STAGE_LABELS } from '../../constants/lifeStages'
import { RISK_CONFIG } from '../RiskBadge'
import { getApiErrorMessage } from '../../utils/apiError'

const RISK_LEVELS = ['SAFE', 'MODERATE', 'TOXIC', 'LETHAL']
const EMPTY_SOURCE = { sourceName: '', sourceUrl: '' }
const INITIAL_FORM = { foodId: '', species: '', lifeStage: '', riskLevel: '', notes: '' }

const isHttpUrl = (value) => /^https?:\/\/\S+$/i.test(value)

const LABEL = 'block font-mono text-xs uppercase tracking-wide text-gray-500 mb-1.5'
const INPUT =
    'w-full min-h-[44px] px-3 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand'

function ProposeEntryForm({ onCreated, onCancel }) {
    const [foods, setFoods] = useState([])
    const [foodsError, setFoodsError] = useState('')
    const [form, setForm] = useState(INITIAL_FORM)
    const [sources, setSources] = useState([{ ...EMPTY_SOURCE }])
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        getAllFoods()
            .then((res) => setFoods([...res.data].sort((a, b) => a.name.localeCompare(b.name, 'es'))))
            .catch((err) =>
                setFoodsError(
                    getApiErrorMessage(err, { fallback: 'No se pudo cargar el catálogo de alimentos.' })
                )
            )
    }, [])

    const setField = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

    const updateSource = (index, field, value) =>
        setSources((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)))
    const addSource = () => setSources((prev) => [...prev, { ...EMPTY_SOURCE }])
    const removeSource = (index) => setSources((prev) => prev.filter((_, i) => i !== index))

    const validate = (filledSources) => {
        if (!form.foodId || !form.species || !form.riskLevel) {
            return 'Completa alimento, especie y nivel de riesgo.'
        }
        for (const source of filledSources) {
            if (!source.sourceName.trim()) return 'Cada fuente necesita un nombre.'
            if (source.sourceUrl.trim() && !isHttpUrl(source.sourceUrl.trim())) {
                return 'Las URL de las fuentes deben empezar con http:// o https://.'
            }
        }
        return ''
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        // Fully empty source rows are ignored
        const filledSources = sources.filter((s) => s.sourceName.trim() || s.sourceUrl.trim())
        const validationError = validate(filledSources)
        if (validationError) {
            setError(validationError)
            return
        }

        setSubmitting(true)
        setError('')
        try {
            await createFoodSafety({
                foodId: Number(form.foodId),
                species: form.species,
                lifeStage: form.lifeStage || null,
                riskLevel: form.riskLevel,
                notes: form.notes.trim() || null,
                sources: filledSources.map((s) => ({
                    sourceName: s.sourceName.trim(),
                    sourceUrl: s.sourceUrl.trim() || null,
                })),
            })
            onCreated()
        } catch (err) {
            setError(
                getApiErrorMessage(err, {
                    fallback: 'No se pudo crear la entrada.',
                    byStatus: {
                        403: 'Solo veterinarios con la cuenta aprobada pueden proponer entradas.',
                        409: 'Ya existe una entrada para este alimento, especie y etapa de vida.',
                    },
                })
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 mb-6 space-y-4"
        >
            <h2 className="font-medium text-gray-900">Proponer una evaluación de riesgo</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="propose-food" className={LABEL}>Alimento</label>
                    <select
                        id="propose-food"
                        value={form.foodId}
                        onChange={setField('foodId')}
                        disabled={!!foodsError}
                        className={INPUT}
                    >
                        <option value="">Selecciona...</option>
                        {foods.map((food) => (
                            <option key={food.id} value={food.id}>{food.name}</option>
                        ))}
                    </select>
                    {foodsError && <p className="text-sm text-risk-toxic mt-1">{foodsError}</p>}
                </div>

                <div>
                    <label htmlFor="propose-species" className={LABEL}>Especie</label>
                    <select id="propose-species" value={form.species} onChange={setField('species')} className={INPUT}>
                        <option value="">Selecciona...</option>
                        {SPECIES.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="propose-stage" className={LABEL}>Etapa de vida</label>
                    <select id="propose-stage" value={form.lifeStage} onChange={setField('lifeStage')} className={INPUT}>
                        <option value="">Todas las etapas</option>
                        {Object.entries(LIFE_STAGE_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <fieldset>
                <legend className={LABEL}>Nivel de riesgo</legend>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {RISK_LEVELS.map((level) => {
                        const config = RISK_CONFIG[level]
                        const selected = form.riskLevel === level
                        return (
                            <label
                                key={level}
                                className={`flex items-center justify-center gap-2 min-h-[44px] px-3 rounded-md border cursor-pointer font-mono text-sm uppercase ${
                                    selected
                                        ? `${config.bg} ${config.border} ${config.text} font-medium ring-1 ring-current`
                                        : 'border-gray-200 text-gray-500'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="riskLevel"
                                    value={level}
                                    checked={selected}
                                    onChange={setField('riskLevel')}
                                    className="sr-only"
                                />
                                <config.Icon size={14} aria-hidden="true" />
                                {level}
                            </label>
                        )
                    })}
                </div>
            </fieldset>

            <div>
                <label htmlFor="propose-notes" className={LABEL}>Notas</label>
                <textarea
                    id="propose-notes"
                    value={form.notes}
                    onChange={setField('notes')}
                    rows={3}
                    placeholder="Qué lo hace peligroso, síntomas, cantidades de referencia..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
            </div>

            <fieldset>
                <legend className={LABEL}>Fuentes</legend>
                <div className="space-y-2">
                    {sources.map((source, index) => (
                        <div key={index} className="flex flex-col md:flex-row gap-2">
                            <input
                                type="text"
                                aria-label={`Nombre de la fuente ${index + 1}`}
                                placeholder="ASPCA"
                                value={source.sourceName}
                                onChange={(e) => updateSource(index, 'sourceName', e.target.value)}
                                className={`${INPUT} md:w-1/3`}
                            />
                            <input
                                type="url"
                                aria-label={`URL de la fuente ${index + 1}`}
                                placeholder="https://..."
                                value={source.sourceUrl}
                                onChange={(e) => updateSource(index, 'sourceUrl', e.target.value)}
                                className={`${INPUT} flex-1`}
                            />
                            {sources.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeSource(index)}
                                    aria-label={`Quitar fuente ${index + 1}`}
                                    className="min-h-[44px] min-w-[44px] flex items-center justify-center border border-gray-300 rounded-md text-gray-500"
                                >
                                    <Trash2 size={16} aria-hidden="true" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={addSource}
                    className="mt-2 inline-flex items-center gap-1 min-h-[44px] text-sm font-medium text-brand"
                >
                    <Plus size={14} aria-hidden="true" />
                    Agregar fuente
                </button>
            </fieldset>

            {error && <p role="alert" className="text-sm text-risk-toxic">{error}</p>}

            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={submitting}
                    className="min-h-[44px] px-4 bg-brand text-white text-sm font-medium rounded-md disabled:opacity-60"
                >
                    {submitting ? 'Guardando...' : 'Crear entrada'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={submitting}
                    className="min-h-[44px] px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700"
                >
                    Cancelar
                </button>
            </div>
        </form>
    )
}

export default ProposeEntryForm