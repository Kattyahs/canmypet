import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function DashboardPage() {
    const { user } = useAuth()

    const today = new Intl.DateTimeFormat('es-CL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    }).format(new Date())

    return (
        <div>
            <p className="font-mono text-xs uppercase tracking-wide text-gray-500 mb-1">
                {today}
            </p>
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Hola, {user?.name}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h2 className="font-medium text-gray-900 mb-1">Mis mascotas</h2>
                    <p className="text-sm text-gray-500 mb-3">Perfiles y etapa de vida</p>
                    <Link to="/pets" className="text-sm text-brand font-medium">
                        Ver mascotas →
                    </Link>
                </div>

                <div className="bg-brand rounded-lg p-5 text-white">
                    <h2 className="font-medium mb-1">Buscar alimento</h2>
                    <p className="text-sm text-white/80 mb-3">Comprueba el riesgo antes de dárselo</p>
                    <Link to="/search" className="text-sm font-medium">
                        Consultar ahora →
                    </Link>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg mb-6">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h2 className="font-medium text-gray-900">Consultas recientes</h2>
                    <Link to="/history" className="text-sm text-brand">
                        Ver historial
                    </Link>
                </div>
                <p className="p-4 text-sm text-gray-400">Aún no tienes consultas registradas.</p>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-gray-900">
                        ¿Tu mascota ya comió algo peligroso?
                    </p>
                    <p className="text-xs text-gray-500">
                        Guías de emergencia paso a paso y contactos de urgencia.
                    </p>
                </div>
                <Link
                    to="/emergency"
                    className="shrink-0 px-4 py-2 bg-risk-toxic text-white text-sm font-medium rounded-md"
                >
                    Abrir guía de emergencia
                </Link>
            </div>
        </div>
    )
}

export default DashboardPage