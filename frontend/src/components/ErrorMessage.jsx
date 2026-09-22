import { AlertCircle, RotateCw } from 'lucide-react'

function ErrorMessage({ message, onRetry }) {
    return (
        <div role="alert" className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle size={18} className="text-risk-toxic shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
                <p className="text-sm text-gray-900">{message}</p>
                {onRetry && (
                    <button
                        type="button"
                        onClick={onRetry}
                        className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand"
                    >
                        <RotateCw size={14} aria-hidden="true" />
                        Reintentar
                    </button>
                )}
            </div>
        </div>
    )
}

export default ErrorMessage