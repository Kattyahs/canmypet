import { useEffect, useState } from 'react'
import { PawPrint } from 'lucide-react'
import { loadPetPhotoUrl } from '../utils/petPhotos'

const SIZES = {
    sm: { box: 'w-8 h-8', icon: 16 },
    md: { box: 'w-12 h-12', icon: 22 },
    lg: { box: 'w-20 h-20', icon: 32 },
}

function PetAvatar({ pet, size = 'sm', selected = false, previewUrl = null }) {
    const { box, icon } = SIZES[size] ?? SIZES.sm
    const [loaded, setLoaded] = useState({ key: null, url: null })
    const photoKey = pet?.hasPhoto ? `${pet.id}:${pet.photoVersion}` : null

    useEffect(() => {
        if (!photoKey || previewUrl) return
        let active = true
        loadPetPhotoUrl(pet)
            .then((url) => {
                if (active) setLoaded({ key: photoKey, url })
            })
            .catch(() => {})
        return () => {
            active = false
        }
    }, [photoKey, previewUrl])

    const url = previewUrl ?? (loaded.key === photoKey ? loaded.url : null)

    if (url) {
        return (
            <img
                src={url}
                alt=""
                className={`${box} shrink-0 rounded-full object-cover bg-gray-100 ${selected ? 'ring-2 ring-brand' : ''}`}
            />
        )
    }

    return (
        <span
            aria-hidden="true"
            className={`${box} shrink-0 rounded-full flex items-center justify-center ${
                selected ? 'bg-brand text-white' : 'bg-gray-100 text-gray-500'
            }`}
        >
            <PawPrint size={icon} />
        </span>
    )
}

export default PetAvatar