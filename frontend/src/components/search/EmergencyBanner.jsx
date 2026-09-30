import { Link } from 'react-router-dom'

function EmergencyBanner() {
    return (
        <section className="bg-red-50 border border-red-100 rounded-lg p-4 md:px-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
                <p className="text-sm font-semibold text-gray-900">¿Tu mascota ya comió algo peligroso?</p>
                <p className="text-sm text-gray-600">Responde tres preguntas y te decimos qué hacer ahora.</p>
            </div>
            <Link
                to="/emergency/start"
                className="shrink-0 inline-flex items-center justify-center min-h-[44px] px-4 rounded-md bg-risk-toxic text-white text-sm font-semibold"
            >
                Mi mascota comió algo
            </Link>
        </section>
    )
}

export default EmergencyBanner