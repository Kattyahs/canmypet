import { useState } from 'react'
import { ExternalLink, LocateFixed } from 'lucide-react'
import { CHILE_CITIES, DEFAULT_CITY_ID, findCity } from '../../constants/chileCities'
import { buildEmbedUrl, buildOpenUrl } from '../../utils/googleMaps'

const EMBED_KEY = import.meta.env.VITE_GOOGLE_MAPS_EMBED_KEY

const cityPlace = (id) => {
    const city = findCity(id)
    return { lat: city.lat, lng: city.lng, cityName: city.name, source: 'city' }
}

const LOCATE_ERRORS = {
    1: 'No diste permiso para usar tu ubicación. Elige tu ciudad.',
    2: 'No pudimos obtener tu ubicación. Elige tu ciudad.',
    3: 'Tu ubicación tardó demasiado. Elige tu ciudad o inténtalo de nuevo.',
}

function NearbyClinics({ apiKey = EMBED_KEY }) {
    const [cityId, setCityId] = useState(DEFAULT_CITY_ID)
    const [place, setPlace] = useState(() => cityPlace(DEFAULT_CITY_ID))
    const [locating, setLocating] = useState(false)
    const [locateError, setLocateError] = useState('')

    const chooseCity = (id) => {
        setCityId(id)
        setLocateError('')
        setPlace(cityPlace(id))
    }

    const useMyLocation = () => {
        if (!navigator.geolocation) {
            setLocateError('Tu navegador no permite obtener la ubicación. Elige tu ciudad.')
            return
        }
        setLocating(true)
        setLocateError('')
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocating(false)
                setPlace({ lat: position.coords.latitude, lng: position.coords.longitude, cityName: null, source: 'device' })
            },
            (error) => {
                setLocating(false)
                setLocateError(LOCATE_ERRORS[error.code] ?? LOCATE_ERRORS[2])
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
        )
    }

    const nearLabel =
        place.source === 'device' ? 'Cerca de tu ubicación.' : `Cerca del centro de ${findCity(cityId).name}.`

    return (
        <section aria-labelledby="nearby-clinics-title" className="bg-white border border-gray-100 rounded-2xl shadow-card p-4 md:p-5 space-y-4">
            <div>
                <h2 id="nearby-clinics-title" className="text-lg font-semibold text-gray-900">
                    Veterinarias de urgencia cercanas
                </h2>
                <p className="text-sm text-gray-500">{nearLabel}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
                <button
                    type="button"
                    onClick={useMyLocation}
                    disabled={locating}
                    className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-xl bg-brand text-white text-sm font-medium disabled:opacity-60"
                >
                    <LocateFixed size={16} aria-hidden="true" />
                    {locating ? 'Buscando tu ubicación...' : 'Usar mi ubicación'}
                </button>
                <label className="sr-only" htmlFor="nearby-clinics-city">
                    Ciudad
                </label>
                <select
                    id="nearby-clinics-city"
                    value={place.source === 'device' ? '' : cityId}
                    onChange={(e) => chooseCity(e.target.value)}
                    className="min-h-[44px] px-3 border border-gray-200 rounded-xl text-base md:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand"
                >
                    {place.source === 'device' && <option value="">Tu ubicación</option>}
                    {CHILE_CITIES.map((city) => (
                        <option key={city.id} value={city.id}>
                            {city.name}
                        </option>
                    ))}
                </select>
            </div>

            {locateError && (
                <p role="alert" className="text-sm text-risk-moderate">
                    {locateError}
                </p>
            )}

            <iframe
                title="Mapa de veterinarias de urgencia cercanas"
                src={buildEmbedUrl(place, apiKey)}
                loading="lazy"
                allowFullScreen
                className="block w-full h-72 md:h-96 rounded-lg border border-gray-200 bg-gray-100"
            />

            <div className="flex flex-col gap-1">
                <a
                    href={buildOpenUrl(place)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 min-h-[44px] text-sm font-medium text-brand"
                >
                    Abrir en Google Maps
                    <ExternalLink size={13} aria-hidden="true" />
                </a>
                <p className="text-xs text-gray-500">
                    Toca una clínica en el mapa para ver su teléfono y horario. Llama antes de ir para confirmar que atienden urgencias.
                </p>
            </div>
        </section>
    )
}

export default NearbyClinics