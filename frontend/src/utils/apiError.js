const DEFAULT_BY_STATUS = {
    400: 'Los datos enviados no son válidos.',
    401: 'Tu sesión expiró. Vuelve a iniciar sesión.',
    403: 'No tienes permiso para realizar esta acción.',
    404: 'El recurso ya no existe.',
    409: 'Ya existe un registro con esos datos.',
}

/**
 * Maps an Axios error to a user-facing Spanish message.
 * Temporary: Task 7 (RFC 7807) will replace status-based mapping with error codes.
 */
export function getApiErrorMessage(err, { fallback, byStatus = {} } = {}) {
    if (!err?.response) {
        return 'No se pudo conectar con el servidor. Revisa tu conexión.'
    }
    const status = err.response.status
    return (
        byStatus[status] ||
        DEFAULT_BY_STATUS[status] ||
        fallback ||
        'Ocurrió un error inesperado. Intenta de nuevo.'
    )
}