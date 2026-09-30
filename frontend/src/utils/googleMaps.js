const SEARCH_TERM = 'veterinaria de urgencia 24 horas'
const ZOOM = 14

const round = (value) => Number(value.toFixed(3))

const searchQuery = (place) => (place.cityName ? `${SEARCH_TERM}, ${place.cityName}, Chile` : SEARCH_TERM)

export function buildEmbedUrl(place, apiKey) {
    const lat = round(place.lat)
    const lng = round(place.lng)
    if (apiKey) {
        const params = new URLSearchParams({
            key: apiKey,
            q: searchQuery(place),
            center: `${lat},${lng}`,
            zoom: String(ZOOM),
            language: 'es',
            region: 'CL',
        })
        return `https://www.google.com/maps/embed/v1/search?${params}`
    }
    const params = new URLSearchParams({ q: searchQuery(place), ll: `${lat},${lng}`, z: String(ZOOM), hl: 'es', output: 'embed' })
    return `https://maps.google.com/maps?${params}`
}

export function buildOpenUrl(place) {
    const query = encodeURIComponent(searchQuery(place)).replace(/%20/g, '+')
    return `https://www.google.com/maps/search/${query}/@${round(place.lat)},${round(place.lng)},${ZOOM}z`
}