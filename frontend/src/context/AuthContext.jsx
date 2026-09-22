import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axiosClient from '../api/axiosClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // Single source of truth for the user shape: always the UserResponse
    // from /api/users/me (id, name, email, role, licenseNumber, verified).
    const fetchCurrentUser = useCallback(async () => {
        const response = await axiosClient.get('/api/users/me')
        setUser(response.data)
        return response.data
    }, [])

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            setLoading(false)
            return
        }
        fetchCurrentUser()
            .catch(() => {
                localStorage.removeItem('token')
                setUser(null)
            })
            .finally(() => setLoading(false))
    }, [fetchCurrentUser])

    const login = async (token) => {
        localStorage.setItem('token', token)
        try {
            return await fetchCurrentUser()
        } catch (err) {
            localStorage.removeItem('token')
            setUser(null)
            throw err
        }
    }

    const logout = () => {
        localStorage.removeItem('token')
        setUser(null)
    }

    return (
        <AuthContext.Provider
            value={{ user, login, logout, loading, refreshUser: fetchCurrentUser }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}