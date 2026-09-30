import { ChevronLeft, ChevronRight } from 'lucide-react'

function Pagination({ page, totalPages, onPageChange, disabled = false }) {
    if (totalPages <= 1) return null

    const isFirst = page === 0
    const isLast = page >= totalPages - 1
    const buttonClass =
        'inline-flex items-center gap-1 min-h-[44px] px-4 border border-gray-200 bg-white rounded-xl text-sm font-medium text-gray-700 hover:bg-bone disabled:opacity-50 disabled:hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand'

    return (
        <nav aria-label="Paginación" className="flex items-center justify-between gap-3 mt-4">
            <button
                type="button"
                onClick={() => onPageChange(page - 1)}
                disabled={disabled || isFirst}
                className={buttonClass}
            >
                <ChevronLeft size={16} aria-hidden="true" />
                Anterior
            </button>

            <p className="text-sm text-gray-500" aria-live="polite">
                Página {page + 1} de {totalPages}
            </p>

            <button
                type="button"
                onClick={() => onPageChange(page + 1)}
                disabled={disabled || isLast}
                className={buttonClass}
            >
                Siguiente
                <ChevronRight size={16} aria-hidden="true" />
            </button>
        </nav>
    )
}

export default Pagination