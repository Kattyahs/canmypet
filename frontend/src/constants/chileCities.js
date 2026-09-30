export const CHILE_CITIES = [
    { id: 'arica', name: 'Arica', lat: -18.4783, lng: -70.3126 },
    { id: 'iquique', name: 'Iquique', lat: -20.2133, lng: -70.1503 },
    { id: 'antofagasta', name: 'Antofagasta', lat: -23.6509, lng: -70.3975 },
    { id: 'copiapo', name: 'Copiapó', lat: -27.3668, lng: -70.3314 },
    { id: 'la-serena', name: 'La Serena', lat: -29.9045, lng: -71.2489 },
    { id: 'valparaiso', name: 'Valparaíso', lat: -33.0472, lng: -71.6127 },
    { id: 'vina-del-mar', name: 'Viña del Mar', lat: -33.0245, lng: -71.5518 },
    { id: 'santiago', name: 'Santiago', lat: -33.4378, lng: -70.6505 },
    { id: 'rancagua', name: 'Rancagua', lat: -34.1708, lng: -70.7444 },
    { id: 'talca', name: 'Talca', lat: -35.4264, lng: -71.6554 },
    { id: 'chillan', name: 'Chillán', lat: -36.6066, lng: -72.1034 },
    { id: 'concepcion', name: 'Concepción', lat: -36.827, lng: -73.0503 },
    { id: 'temuco', name: 'Temuco', lat: -38.7359, lng: -72.5904 },
    { id: 'valdivia', name: 'Valdivia', lat: -39.8142, lng: -73.2459 },
    { id: 'puerto-montt', name: 'Puerto Montt', lat: -41.4689, lng: -72.9411 },
    { id: 'coyhaique', name: 'Coyhaique', lat: -45.5712, lng: -72.0685 },
    { id: 'punta-arenas', name: 'Punta Arenas', lat: -53.1638, lng: -70.9171 },
]

export const DEFAULT_CITY_ID = 'santiago'

export const findCity = (id) => CHILE_CITIES.find((city) => city.id === id) ?? CHILE_CITIES.find((city) => city.id === DEFAULT_CITY_ID)