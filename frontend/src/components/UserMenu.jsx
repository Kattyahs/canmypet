import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown, LogOut } from 'lucide-react'

function UserMenu({ user, onLogout, placement = 'up' }) {
    const [open, setOpen] = useState(false)
    const containerRef = useRef(null)
    const triggerRef = useRef(null)
    const itemRef = useRef(null)
    const menuId = useId()

    const initials = user?.name
        ?.split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()

    useEffect(() => {
        if (!open) return

        itemRef.current?.focus()

        const handlePointerDown = (event) => {
            if (!containerRef.current?.contains(event.target)) setOpen(false)
        }
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setOpen(false)
                triggerRef.current?.focus()
            }
        }

        document.addEventListener('mousedown', handlePointerDown)
        document.addEventListener('touchstart', handlePointerDown)
        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('mousedown', handlePointerDown)
            document.removeEventListener('touchstart', handlePointerDown)
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [open])

    const menuPosition = placement === 'up' ? 'bottom-full mb-1 left-0 w-full' : 'top-full mt-1 right-0 w-56'

    return (
        <div ref={containerRef} className="relative">
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls={menuId}
                aria-label={`Menú de ${user?.name ?? 'usuario'}`}
                className="flex items-center gap-2 w-full min-h-[44px] px-2 py-2 rounded-md hover:bg-white/60 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
                <span className="w-8 h-8 shrink-0 rounded-full bg-brand text-white text-xs font-medium flex items-center justify-center">
                    {initials}
                </span>
                {placement === 'up' && (
                    <span className="flex-1 min-w-0">
                        <span className="block text-sm font-medium text-gray-900 truncate">{user?.name}</span>
                        <span className="block text-xs text-gray-500">{user?.role}</span>
                    </span>
                )}
                <ChevronDown
                    size={16}
                    aria-hidden="true"
                    className={`text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
                />
            </button>

            {open && (
                <div
                    id={menuId}
                    role="menu"
                    aria-label="Opciones de la cuenta"
                    className={`absolute ${menuPosition} z-20 bg-white border border-gray-200 rounded-md shadow-lg py-1`}
                >
                    {placement === 'down' && (
                        <div className="px-3 py-2 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500">{user?.role}</p>
                        </div>
                    )}
                    <button
                        ref={itemRef}
                        type="button"
                        role="menuitem"
                        onClick={onLogout}
                        className="w-full flex items-center gap-2 min-h-[44px] px-3 text-left text-sm text-risk-toxic hover:bg-gray-50 focus:outline-none focus-visible:bg-gray-50"
                    >
                        <LogOut size={16} aria-hidden="true" />
                        Cerrar sesión
                    </button>
                </div>
            )}
        </div>
    )
}

export default UserMenu