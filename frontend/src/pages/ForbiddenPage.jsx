import { Link } from 'react-router-dom'
import { ShieldX } from 'lucide-react'

function ForbiddenPage() {
    return (
        <div className="max-w-md mx-auto mt-16 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
                <ShieldX size={24} className="text-risk-toxic" />
            </div>
            <p className="font-mono text-xs uppercase tracking-wide text-gray-500 mb-1">Error 403</p>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">No tienes acceso a esta sección</h1>
            <p className="text-sm text-gray-500 mb-6">
                Esta página está disponible solo para otro tipo de cuenta.
            </p>
            <Link
                to="/dashboard"
                className="inline-flex items-center justify-center min-h-[44px] px-4 bg-brand text-white text-sm font-medium rounded-md"
            >
                Volver al inicio
            </Link>
        </div>
    )
}

export default ForbiddenPage