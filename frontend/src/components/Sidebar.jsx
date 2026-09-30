import { Link, NavLink, useLocation } from 'react-router-dom'
import {
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
import Logo from './Logo'

export const NAV_ITEMS = [
    { to: '/search', label: 'Buscar alimento', mobileLabel: 'Buscar', Icon: Search, mobilePriority: 1 },
    { to: '/pets', label: 'Mis mascotas', mobileLabel: 'Mascotas', Icon: PawPrint, mobilePriority: 4 },
    { to: '/history', label: 'Historial', mobileLabel: 'Historial', Icon: ClipboardList, mobilePriority: 6 },
    { to: '/faq', label: 'FAQ', mobileLabel: 'FAQ', Icon: HelpCircle, mobilePriority: 5 },
    {
        to: '/vet',
        label: 'Panel veterinario',
        mobileLabel: 'Panel',
        Icon: Stethoscope,
        roles: ['VETERINARIAN'],
        mobilePriority: 3,
    },
    {
        to: '/admin',
        label: 'Administración',
        mobileLabel: 'Admin',
        Icon: ShieldCheck,
        roles: ['ADMIN'],
        mobilePriority: 3,
    },
    { to: '/emergency', label: 'Emergencias', mobileLabel: 'Emergencia', Icon: AlertTriangle, mobilePriority: 2 },
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
    const overflowItems = visibleItems.filter((item) => !mobileSet.has(item))
    return { visibleItems, mobileTabs, overflowItems }
}

const mobileTabClass = (isEmergency) => ({ isActive }) => {
    const color = isEmergency ? 'text-risk-toxic' : isActive ? 'text-brand' : 'text-gray-500'
    const indicator = isActive ? (isEmergency ? 'before:bg-risk-toxic' : 'before:bg-brand') : 'before:bg-transparent'
    const background = isEmergency && isActive ? 'bg-red-50' : ''
    return `relative flex-1 min-w-0 min-h-[56px] flex flex-col items-center justify-center gap-1 px-1 text-[11px] leading-none before:absolute before:top-0 before:inset-x-3 before:h-0.5 before:rounded-full ${color} ${indicator} ${background} ${
        isActive || isEmergency ? 'font-semibold' : 'font-medium'
    }`
}

function Sidebar() {
    const { user, logout } = useAuth()
    const { pathname } = useLocation()
    const { visibleItems, mobileTabs, overflowItems } = getNavItems(user?.role)

    return (
        <>
            <aside className="hidden md:flex md:flex-col md:w-[236px] md:h-screen md:sticky md:top-0 bg-bone border-r border-gray-200 p-4">
                <Link to="/" aria-label="CanMyPet?, ir al inicio" className="block mb-8 px-2">
                    <Logo />
                </Link>

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
                <Link to="/" aria-label="CanMyPet?, ir al inicio" className="flex items-center min-h-[44px]">
                    <Logo className="h-8" />
                </Link>
                <UserMenu key={pathname} user={user} onLogout={logout} placement="down" links={overflowItems} />
            </header>

            <nav
                aria-label="Navegación principal"
                className="md:hidden fixed bottom-0 inset-x-0 z-10 flex bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)] shadow-[0_-1px_8px_rgba(15,23,42,0.06)]"
            >
                {mobileTabs.map(({ to, label, mobileLabel, Icon }) => {
                    const isEmergency = to === '/emergency'
                    return (
                        <NavLink key={to} to={to} aria-label={label} className={mobileTabClass(isEmergency)}>
                            <Icon size={22} aria-hidden="true" strokeWidth={isEmergency ? 2.4 : 2} />
                            <span className="block max-w-full truncate">{mobileLabel}</span>
                        </NavLink>
                    )
                })}
            </nav>
        </>
    )
}

export default Sidebar