import { useState } from 'react'
import { createFood, updateFood } from '../../api/foods'
import { getApiErrorMessage } from '../../utils/apiError'

const LABEL = 'block font-mono text-xs uppercase tracking-wide text-gray-500 mb-1.5'
const INPUT =
    'w-full min-h-[44px] px-3 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand'

function FoodForm({ food, onSaved, onCancel }) {
    const isEdit = Boolean(food)
    const idPrefix = isEdit ? `food-${food.id}` : 'food-new'
    const [form, setForm] = useState({
        name: food?.name ?? '',
        category: food?.category ?? '',
        description: food?.description ?? '',
    })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const setField = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }))
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const payload = {
            name: form.name.trim(),
            category: form.category.trim(),
            description: form.description.trim() || null,
        }
        if (!payload.name || !payload.category) {
            setError('Completa el nombre y la categoría.')
            return
        }

        setSubmitting(true)
        setError('')
        try {
            const res = isEdit ? await updateFood(food.id, payload) : await createFood(payload)
            onSaved(res.data)
        } catch (err) {
            setError(
                getApiErrorMessage(err, {
                    fallback: isEdit ? 'No se pudo guardar el alimento.' : 'No se pudo crear el alimento.',
                    byStatus: {
                        403: 'Solo un administrador puede gestionar el catálogo.',
                        404: 'Este alimento ya no existe. Recarga la lista.',
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
            aria-label={isEdit ? `Editar ${food.name}` : 'Nuevo alimento'}
            className="bg-white border border-gray-200 rounded-lg p-4 space-y-4"
            noValidate
        >
            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <label htmlFor={`${idPrefix}-name`} className={LABEL}>
                        Nombre
                    </label>
                    <input
                        id={`${idPrefix}-name`}
                        type="text"
                        value={form.name}
                        onChange={setField('name')}
                        maxLength={255}
                        className={INPUT}
                    />
                </div>
                <div>
                    <label htmlFor={`${idPrefix}-category`} className={LABEL}>
                        Categoría
                    </label>
                    <input
                        id={`${idPrefix}-category`}
                        type="text"
                        value={form.category}
                        onChange={setField('category')}
                        maxLength={255}
                        placeholder="fruta, verdura, lácteo..."
                        className={INPUT}
                    />
                </div>
            </div>

            <div>
                <label htmlFor={`${idPrefix}-description`} className={LABEL}>
                    Descripción
                </label>
                <textarea
                    id={`${idPrefix}-description`}
                    value={form.description}
                    onChange={setField('description')}
                    rows={3}
                    className={`${INPUT} py-2`}
                />
            </div>

            {error && (
                <p role="alert" className="text-sm text-risk-toxic">
                    {error}
                </p>
            )}

            <div className="flex flex-wrap gap-2">
                <button
                    type="submit"
                    disabled={submitting}
                    className="min-h-[44px] px-4 bg-brand text-white text-sm font-medium rounded-md disabled:opacity-60"
                >
                    {submitting ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear alimento'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={submitting}
                    className="min-h-[44px] px-4 border border-gray-300 bg-white text-sm font-medium rounded-md text-gray-700 disabled:opacity-60"
                >
                    Cancelar
                </button>
            </div>
        </form>
    )
}

export default FoodForm