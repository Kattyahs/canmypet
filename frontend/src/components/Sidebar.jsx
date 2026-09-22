import { NavLink } from 'react-router-dom'
import { Home, PawPrint, Search, ClipboardList, HelpCircle, AlertTriangle, LogOut,Stethoscope  } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export const NAV_ITEMS = [
    { to: '/dashboard', label: 'Inicio', Icon: Home, mobilePriority: 1 },
    { to: '/pets', label: 'Mis mascotas', Icon: PawPrint, mobilePriority: 4 },
    { to: '/search', label: 'Buscar alimento', Icon: Search, mobilePriority: 2 },
    { to: '/history', label: 'Historial', Icon: ClipboardList, mobilePriority: 6 },
    { to: '/faq', label: 'FAQ', Icon: HelpCircle, mobilePriority: 5 },
    {
        to: '/vet',
        label: 'Panel veterinario',
        Icon: Stethoscope,
        roles: ['VETERINARIAN'],
        mobilePriority: 3,
    },
    { to: '/emergency', label: 'Emergencias', Icon: AlertTriangle, mobilePriority: 7 },
]

const MOBILE_TAB_LIMIT = 5

export function getNavItems(role) {
    const visibleItems = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role))
    const mobileSet = new Set(
        [...visibleItems]
            .sort((a, b) => a.mobilePriority - b.mobilePriority)
            .slice(0, MOBILE_TAB_LIMIT)
    )
    // Keep the desktop order on mobile too
    const mobileTabs = visibleItems.filter((item) => mobileSet.has(item))
    return { visibleItems, mobileTabs }
}

function Sidebar() {
    const { user, logout } = useAuth()
    const { visibleItems, mobileTabs } = getNavItems(user?.role)

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
                    {visibleItems.map(({ to, label, Icon }) => {
                        const isEmergency = to === '/emergency'
                        return (
                            <NavLink
                                key={to}
                                to={to}
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                                        isActive
                                            ? 'bg-white text-brand font-medium border border-gray-200'
                                            : isEmergency
                                                ? 'text-risk-toxic hover:bg-white/60'
                                                : 'text-gray-600 hover:bg-white/60'
                                    }`
                                }
                            >
                                <Icon size={18} />
                                {label}
                            </NavLink>
                        )
                    })}
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
                            className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-risk-toxic hover:bg-gray-50 rounded-md"
                        >
                            <LogOut size={16} />
                            Cerrar sesión
                        </button>
                    </div>
                </div>
            </aside>

            {/* Sidebar mobile */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-10">
                {mobileTabs.map(({ to, label, Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `flex-1 flex flex-col items-center gap-0.5 py-2 text-xs ${
                                isActive ? 'text-brand' : 'text-gray-500'
                            }`
                        }
                    >
                        <Icon size={20} />
                        {label}
                    </NavLink>
                ))}
            </nav>
        </>
    )
}

export default Sidebar