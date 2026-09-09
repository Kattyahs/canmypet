import { createContext, useContext, useState, useEffect } from 'react'
import axiosClient from '../api/axiosClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            axiosClient
                .get('/api/users/me')
                .then((response) => setUser(response.data))
                .catch(() => {
                    localStorage.removeItem('token')
                    setUser(null)
                })
                .finally(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, [])

    const login = (token, userData) => {
        localStorage.setItem('token', token)
        setUser(userData)
    }

    const logout = () => {
        localStorage.removeItem('token')
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}