import { NavLink, useLocation } from 'react-router-dom'
import {
    Home,
    PawPrint,
    Search,
    ClipboardList,
    HelpCircle,
    AlertTriangle,
    Stethoscope,
    ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import UserMenu from './UserMenu'

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
    {
        to: '/admin',
        label: 'Administración',
        Icon: ShieldCheck,
        roles: ['ADMIN'],
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
    const mobileTabs = visibleItems.filter((item) => mobileSet.has(item))
    return { visibleItems, mobileTabs }
}

function Sidebar() {
    const { user, logout } = useAuth()
    const { pathname } = useLocation()
    const { visibleItems, mobileTabs } = getNavItems(user?.role)

    return (
        <>
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

                <UserMenu key={pathname} user={user} onLogout={logout} placement="up" />
            </aside>

            <header className="md:hidden sticky top-0 z-10 flex items-center justify-between bg-bone border-b border-gray-200 px-4 py-1">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-brand" />
                    <span className="font-semibold text-gray-900">CanMyPet</span>
                </div>
                <UserMenu key={pathname} user={user} onLogout={logout} placement="down" />
            </header>

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