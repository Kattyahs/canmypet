import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { usePagination } from './usePagination'

const pageOf = (content, page = 0, totalPages = 1) => ({
    content,
    page,
    size: 20,
    totalElements: content.length,
    totalPages,
})

describe('usePagination', () => {
    it('loads the first page with the requested size', async () => {
        const fetchPage = vi.fn().mockResolvedValue({ data: pageOf(['a', 'b']) })
        const { result } = renderHook(() => usePagination(fetchPage, { size: 5 }))

        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(fetchPage).toHaveBeenCalledWith({ page: 0, size: 5 })
        expect(result.current.items).toEqual(['a', 'b'])
    })

    it('fetches another page on goToPage', async () => {
        const fetchPage = vi
            .fn()
            .mockResolvedValueOnce({ data: pageOf(['a'], 0, 2) })
            .mockResolvedValueOnce({ data: pageOf(['b'], 1, 2) })
        const { result } = renderHook(() => usePagination(fetchPage))

        await waitFor(() => expect(result.current.items).toEqual(['a']))
        act(() => result.current.goToPage(1))

        await waitFor(() => expect(result.current.items).toEqual(['b']))
        expect(result.current.page).toBe(1)
    })

    it('steps back when the current page becomes empty', async () => {
        const fetchPage = vi
            .fn()
            .mockResolvedValueOnce({ data: pageOf(['a'], 0, 2) })
            .mockResolvedValueOnce({ data: pageOf([], 1, 1) })
            .mockResolvedValueOnce({ data: pageOf(['a'], 0, 1) })
        const { result } = renderHook(() => usePagination(fetchPage))

        await waitFor(() => expect(result.current.items).toEqual(['a']))
        act(() => result.current.goToPage(1))

        await waitFor(() => expect(fetchPage).toHaveBeenCalledTimes(3))
        expect(fetchPage).toHaveBeenLastCalledWith({ page: 0, size: 20 })
        await waitFor(() => expect(result.current.page).toBe(0))
    })

    it('ignores a slower response from an older request', async () => {
        let resolveFirst
        const fetchPage = vi
            .fn()
            .mockImplementationOnce(() => new Promise((resolve) => (resolveFirst = resolve)))
            .mockResolvedValueOnce({ data: pageOf(['new']) })
        const { result } = renderHook(() => usePagination(fetchPage))

        act(() => {
            result.current.reload()
        })
        await waitFor(() => expect(result.current.items).toEqual(['new']))

        await act(async () => {
            resolveFirst({ data: pageOf(['old']) })
        })
        expect(result.current.items).toEqual(['new'])
    })

    it('exposes the error when loading fails', async () => {
        const failure = { response: { status: 500 } }
        const fetchPage = vi.fn().mockRejectedValue(failure)
        const { result } = renderHook(() => usePagination(fetchPage))

        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(result.current.error).toBe(failure)
        expect(result.current.items).toEqual([])
    })
})