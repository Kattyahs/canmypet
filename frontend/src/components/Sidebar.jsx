import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
    { to: '/dashboard', label: 'Inicio', icon: '🏠' },
    { to: '/pets', label: 'Mis mascotas', icon: '🐾' },
    { to: '/search', label: 'Buscar alimento', icon: '🔍' },
    { to: '/history', label: 'Historial', icon: '📋' },
    { to: '/faq', label: 'FAQ', icon: '❓' },
    { to: '/emergency', label: 'Emergencias', icon: '🚨' },
]

const MOBILE_TABS = NAV_ITEMS.slice(0, 5)

function Sidebar() {
    const { user, logout } = useAuth()

    const initials = user?.name
        ?.split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()

    return (
        <>
            {/* Sidebar desktop */}
            <aside className="hidden md:flex md:flex-col md:w-[236px] md:h-screen md:sticky md:top-0 bg-bone border-r border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-8 px-2">
                    <div className="w-6 h-6 rounded bg-brand" />
                    <span className="font-semibold text-gray-900">CanMyPet</span>
                </div>

                <nav className="flex-1 space-y-1">
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                                    isActive
                                        ? 'bg-white text-brand font-medium border border-gray-200'
                                        : 'text-gray-600 hover:bg-white/60'
                                }`
                            }
                        >
                            <span>{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="relative group">
                    <button className="flex items-center gap-2 w-full px-2 py-2 rounded-md hover:bg-white/60 text-left">
                        <div className="w-8 h-8 rounded-full bg-brand text-white text-xs font-medium flex items-center justify-center">
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500">{user?.role}</p>
                        </div>
                    </button>

                    <div className="absolute bottom-full left-0 mb-1 w-full bg-white border border-gray-200 rounded-md shadow-lg hidden group-hover:block">
                        <button
                            onClick={logout}
                            className="w-full text-left px-3 py-2 text-sm text-risk-toxic hover:bg-gray-50 rounded-md"
                        >
                            Cerrar sesión
                        </button>
                    </div>
                </div>
            </aside>

            {/* Barra inferior mobile */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-10">
                {MOBILE_TABS.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex-1 flex flex-col items-center gap-0.5 py-2 text-xs ${
                                isActive ? 'text-brand' : 'text-gray-500'
                            }`
                        }
                    >
                        <span>{item.icon}</span>
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </>
    )
}

export default Sidebar