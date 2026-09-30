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
    { to: '/faq', label: 'Preguntas frecuentes', mobileLabel: 'Ayuda', Icon: HelpCircle, mobilePriority: 5 },
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

const desktopLinkClass = (isEmergency) => ({ isActive }) => {
    if (isActive) {
        return `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${
            isEmergency ? 'bg-red-50 text-risk-toxic' : 'bg-brand-soft text-brand'
        }`
    }
    return `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        isEmergency ? 'text-risk-toxic hover:bg-red-50' : 'text-gray-600 hover:bg-bone hover:text-gray-900'
    }`
}

const mobileTabClass = (isEmergency) => ({ isActive }) => {
    const color = isEmergency ? 'text-risk-toxic' : isActive ? 'text-brand' : 'text-gray-500'
    const indicator = isActive ? (isEmergency ? 'before:bg-risk-toxic' : 'before:bg-brand') : 'before:bg-transparent'
    return `relative flex-1 min-w-0 min-h-[60px] flex flex-col items-center justify-center gap-1 px-1 text-[11px] leading-none before:absolute before:top-0 before:inset-x-4 before:h-[3px] before:rounded-b-full ${color} ${indicator} ${
        isActive || isEmergency ? 'font-semibold' : 'font-medium'
    }`
}

const mobileIconClass = (isEmergency, isActive) => {
    if (!isActive) return 'flex items-center justify-center w-10 h-7 rounded-full'
    return `flex items-center justify-center w-10 h-7 rounded-full ${isEmergency ? 'bg-red-50' : 'bg-brand-soft'}`
}

function Sidebar() {
    const { user, logout } = useAuth()
    const { pathname } = useLocation()
    const { visibleItems, mobileTabs, overflowItems } = getNavItems(user?.role)

    return (
        <>
            <aside className="hidden md:flex md:flex-col md:w-[248px] md:h-screen md:sticky md:top-0 bg-white border-r border-gray-100 px-4 py-6">
                <Link to="/" aria-label="CanMyPet?, ir al inicio" className="block mb-8 px-2">
                    <Logo />
                </Link>

                <nav aria-label="Navegación principal" className="flex-1 space-y-1">
                    {visibleItems.map(({ to, label, Icon }) => (
                        <NavLink key={to} to={to} className={desktopLinkClass(to === '/emergency')}>
                            <Icon size={18} aria-hidden="true" />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <div className="pt-4 border-t border-gray-100">
                    <UserMenu key={pathname} user={user} onLogout={logout} placement="up" />
                </div>
            </aside>

            <header className="md:hidden sticky top-0 z-10 flex items-center justify-between bg-white/95 backdrop-blur border-b border-gray-100 px-4 py-1">
                <Link to="/" aria-label="CanMyPet?, ir al inicio" className="flex items-center min-h-[44px]">
                    <Logo className="h-8" />
                </Link>
                <UserMenu key={pathname} user={user} onLogout={logout} placement="down" links={overflowItems} />
            </header>

            <nav
                aria-label="Navegación principal"
                className="md:hidden fixed bottom-0 inset-x-0 z-10 flex bg-white border-t border-gray-100 pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_12px_rgba(15,23,42,0.06)]"
            >
                {mobileTabs.map(({ to, label, mobileLabel, Icon }) => {
                    const isEmergency = to === '/emergency'
                    return (
                        <NavLink key={to} to={to} aria-label={label} className={mobileTabClass(isEmergency)}>
                            {({ isActive }) => (
                                <>
                                    <span className={mobileIconClass(isEmergency, isActive)}>
                                        <Icon size={20} aria-hidden="true" strokeWidth={isEmergency ? 2.4 : 2} />
                                    </span>
                                    <span className="block max-w-full truncate">{mobileLabel}</span>
                                </>
                            )}
                        </NavLink>
                    )
                })}
            </nav>
        </>
    )
}

export default Sidebar