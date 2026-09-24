const HOME_BY_ROLE = {
    OWNER: '/search',
    VETERINARIAN: '/vet',
    ADMIN: '/admin',
}

export const getHomePath = (role) => HOME_BY_ROLE[role] ?? '/search'