import { getPetPhoto } from '../api/pets'

const cache = new Map()

export function loadPetPhotoUrl(pet) {
    const key = `${pet.id}:${pet.photoVersion}`
    if (!cache.has(key)) {
        const request = getPetPhoto(pet.id)
            .then((res) => URL.createObjectURL(res.data))
            .catch((err) => {
                cache.delete(key)
                throw err
            })
        cache.set(key, request)
    }
    return cache.get(key)
}

export function clearPetPhotoCache() {
    cache.clear()
}