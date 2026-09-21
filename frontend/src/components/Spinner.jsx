import { Loader2 } from 'lucide-react'

function Spinner({ label = 'Cargando...' }) {
    return (
        <div role="status" className="flex items-center gap-2 py-4 text-sm text-gray-500">
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            <span>{label}</span>
        </div>
    )
}

export default Spinner