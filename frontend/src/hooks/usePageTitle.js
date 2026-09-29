import { useEffect } from 'react'

export const APP_NAME = 'CanMyPet?'
export const DEFAULT_TITLE = `${APP_NAME} · ¿Puede comerlo tu mascota?`

const PAGE_TITLES = [
    ['/search', 'Buscar alimento'],
    ['/pets', 'Mis mascotas'],
    ['/history', 'Historial'],
    ['/faq', 'Preguntas frecuentes'],
    ['/emergency', 'Emergencias'],
    ['/vet', 'Panel veterinario'],
    ['/admin', 'Administración'],
]

export const getPageTitle = (pathname) =>
    PAGE_TITLES.find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`))?.[1] ?? null

export function usePageTitle(title) {
    useEffect(() => {
        document.title = title ? `${title} · ${APP_NAME}` : DEFAULT_TITLE
    }, [title])
}