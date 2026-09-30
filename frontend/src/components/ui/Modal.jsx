import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function Modal({ open, title, onClose, initialFocusRef, dismissible = true, size = 'md', children }) {
    const panelRef = useRef(null)
    const titleId = useId()
    const onCloseRef = useRef(onClose)
    const dismissibleRef = useRef(dismissible)
    onCloseRef.current = onClose
    dismissibleRef.current = dismissible

    useEffect(() => {
        if (!open) return
        const previouslyFocused = document.activeElement
        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        ;(initialFocusRef?.current ?? panelRef.current)?.focus()

        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && dismissibleRef.current) {
                event.stopPropagation()
                onCloseRef.current()
                return
            }
            if (event.key !== 'Tab' || !panelRef.current) return
            const focusable = [...panelRef.current.querySelectorAll(FOCUSABLE)]
            if (focusable.length === 0) return
            const first = focusable[0]
            const last = focusable[focusable.length - 1]
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault()
                last.focus()
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault()
                first.focus()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = previousOverflow
            previouslyFocused?.focus?.()
        }
    }, [open, initialFocusRef])

    if (!open) return null

    const width = size === 'sm' ? 'sm:max-w-md' : 'sm:max-w-lg'

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gray-900/40 sm:p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && dismissible) onClose()
            }}
        >
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                className={`w-full ${width} max-h-[92vh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-2xl shadow-raised focus:outline-none`}
            >
                <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 py-4 bg-white border-b border-gray-100">
                    <h2 id={titleId} className="text-lg font-semibold text-gray-900">
                        {title}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={!dismissible}
                        aria-label="Cerrar"
                        className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-bone focus:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-40"
                    >
                        <X size={20} aria-hidden="true" />
                    </button>
                </div>
                <div className="px-5 py-5">{children}</div>
            </div>
        </div>
    )
}

export default Modal