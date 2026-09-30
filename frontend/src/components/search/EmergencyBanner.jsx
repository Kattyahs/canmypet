import { Link } from 'react-router-dom'
import { AlertTriangle, ChevronRight } from 'lucide-react'

function EmergencyBanner() {
    return (
        <Link
            to="/emergency/start"
            className="group flex items-center gap-3 md:gap-4 p-4 md:px-5 rounded-2xl bg-red-50 border border-red-100 hover:bg-red-100/70 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-risk-toxic"
        >
            <span className="shrink-0 w-10 h-10 rounded-full bg-white text-risk-toxic flex items-center justify-center">
                <AlertTriangle size={20} aria-hidden="true" />
            </span>
            <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-risk-toxic">Mi mascota comió algo</span>
                <span className="block text-sm text-gray-600">¿Te preocupa? Tres preguntas y te decimos qué hacer ahora.</span>
            </span>
            <ChevronRight size={20} className="shrink-0 text-risk-toxic transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
    )
}

export default EmergencyBanner