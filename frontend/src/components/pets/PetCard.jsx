import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { MoreHorizontal, Pencil, Search, Trash2 } from 'lucide-react'
import { getSpeciesLabel } from '../../constants/species'
import { getLifeStageLabel } from '../../constants/lifeStages'
import PetAvatar from '../PetAvatar'
import { buttonClasses } from '../ui/Button'

function PetCard({ pet, onEdit, onDelete }) {
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef(null)
    const triggerRef = useRef(null)
    const itemRef = useRef(null)
    const menuId = useId()

    useEffect(() => {
        if (!menuOpen) return
        itemRef.current?.focus()
        const handlePointerDown = (event) => {
            if (!menuRef.current?.contains(event.target)) setMenuOpen(false)
        }
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setMenuOpen(false)
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
    }, [menuOpen])

    const details = [pet.breed, pet.weight ? `${pet.weight} kg` : null].filter(Boolean).join(' · ')

    return (
        <article className="relative flex flex-col items-center text-center bg-white border border-gray-100 rounded-2xl shadow-card p-5 pt-6">
            <div ref={menuRef} className="absolute top-3 right-3">
                <button
                    ref={triggerRef}
                    type="button"
                    onClick={() => setMenuOpen((prev) => !prev)}
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                    aria-controls={menuId}
                    aria-label={`Más opciones para ${pet.name}`}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-bone hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                    <MoreHorizontal size={20} aria-hidden="true" />
                </button>
                {menuOpen && (
                    <div
                        id={menuId}
                        role="menu"
                        aria-label={`Opciones de ${pet.name}`}
                        className="absolute right-0 top-full mt-1 z-20 w-48 py-1 bg-white border border-gray-100 rounded-xl shadow-raised text-left"
                    >
                        <button
                            ref={itemRef}
                            type="button"
                            role="menuitem"
                            onClick={() => {
                                setMenuOpen(false)
                                onDelete(pet)
                            }}
                            className="w-full flex items-center gap-2 min-h-[44px] px-3 text-sm text-risk-toxic hover:bg-red-50 focus:outline-none focus-visible:bg-red-50"
                        >
                            <Trash2 size={16} aria-hidden="true" />
                            Eliminar mascota
                        </button>
                    </div>
                )}
            </div>

            <span className="block rounded-full p-1 ring-1 ring-gray-100">
                <PetAvatar pet={pet} size="xl" />
            </span>
            <h2 className="mt-3 text-lg font-semibold text-gray-900">{pet.name}</h2>
            <p className="text-sm text-gray-600">
                {getSpeciesLabel(pet.species)}
                {pet.lifeStage ? ` · ${getLifeStageLabel(pet.lifeStage)}` : ''}
            </p>
            {details && <p className="mt-0.5 text-xs text-gray-400">{details}</p>}

            <div className="mt-5 w-full flex flex-col gap-2">
                <Link to={`/search?petId=${pet.id}`} className={buttonClasses({ fullWidth: true })}>
                    <Search size={16} aria-hidden="true" />
                    Consultar alimento
                </Link>
                <button
                    type="button"
                    onClick={() => onEdit(pet)}
                    className={buttonClasses({ variant: 'secondary', fullWidth: true })}
                >
                    <Pencil size={16} aria-hidden="true" />
                    Editar perfil
                </button>
            </div>
        </article>
    )
}

export default PetCard