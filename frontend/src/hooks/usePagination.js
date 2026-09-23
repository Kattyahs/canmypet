import { useCallback, useEffect, useRef, useState } from 'react'

const EMPTY_PAGE = { content: [], page: 0, size: 0, totalElements: 0, totalPages: 0 }

export function usePagination(fetchPage, { size = 20 } = {}) {
    const [page, setPage] = useState(0)
    const [data, setData] = useState(EMPTY_PAGE)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    // Only the latest request may update state: a slow older response
    // must never overwrite a newer one
    const latestRequest = useRef(0)

    const load = useCallback(
        async (targetPage) => {
            const requestId = ++latestRequest.current
            setLoading(true)
            setError(null)
            try {
                const res = await fetchPage({ page: targetPage, size })
                if (requestId !== latestRequest.current) return

                // The page emptied (e.g. its last item was verified): step back
                if (res.data.content.length === 0 && targetPage > 0) {
                    setPage(targetPage - 1)
                    return
                }
                setData(res.data)
            } catch (err) {
                if (requestId === latestRequest.current) setError(err)
            } finally {
                if (requestId === latestRequest.current) setLoading(false)
            }
        },
        [fetchPage, size]
    )

    useEffect(() => {
        load(page)
    }, [load, page])

    const goToPage = useCallback(
        (target) => {
            const lastPage = Math.max(data.totalPages - 1, 0)
            setPage(Math.min(Math.max(target, 0), lastPage))
        },
        [data.totalPages]
    )

    const reload = useCallback(() => load(page), [load, page])

    return {
        items: data.content,
        page,
        totalPages: data.totalPages,
        totalElements: data.totalElements,
        loading,
        error,
        goToPage,
        reload,
    }
}