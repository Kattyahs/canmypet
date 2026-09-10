import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axiosClient from '../api/axiosClient'

function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const response = await axiosClient.post('/api/auth/login', { email, password })
            login(response.data.token, response.data)
            navigate('/dashboard')
        } catch (err) {
            setError('Email o contraseña incorrectos.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-bone flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-6 h-6 rounded bg-brand" />
                    <span className="font-semibold text-gray-900">CanMyPet</span>
                </div>

                <h1 className="text-2xl font-semibold text-gray-900 mb-1">Iniciar sesión</h1>
                <p className="text-sm text-gray-500 mb-6">
                    Consulta qué alimentos son seguros para tus mascotas.
                </p>

                <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="mb-4">
                        <label className="block font-mono text-xs uppercase tracking-wide text-gray-500 mb-1.5">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ana@correo.com"
                            required
                            className="w-full min-h-[44px] px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                        />
                    </div>

                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="font-mono text-xs uppercase tracking-wide text-gray-500">
                                Contraseña
                            </label>
                            <span className="text-xs text-brand cursor-pointer">¿La olvidaste?</span>
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full min-h-[44px] px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                        />
                    </div>

                    <label className="flex items-center gap-2 mb-5 text-sm text-gray-600">
                        <input type="checkbox" className="rounded border-gray-300" />
                        Mantener la sesión abierta
                    </label>

                    {error && <p className="text-sm text-risk-toxic mb-4">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full min-h-[44px] bg-brand text-white text-sm font-medium rounded-md hover:opacity-90 disabled:opacity-60"
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-4">
                    ¿No tienes cuenta?{' '}
                    <Link to="/register" className="text-brand font-medium">
                        Crear cuenta
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default LoginPage