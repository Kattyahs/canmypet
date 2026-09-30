import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axiosClient from '../api/axiosClient'
import Logo from '../components/Logo'
import { usePageTitle } from '../hooks/usePageTitle'
import { getApiErrorMessage } from '../utils/apiError'

const LABEL = 'block font-mono text-xs uppercase tracking-wide text-gray-500 mb-1.5'
const INPUT =
    'w-full min-h-[44px] px-3 border border-gray-300 rounded-md text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-brand'

function LoginPage() {
    usePageTitle('Iniciar sesión')
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
            await login(response.data.token)
            navigate('/')
        } catch (err) {
            setError(
                getApiErrorMessage(err, {
                    fallback: 'No se pudo iniciar sesión. Intenta de nuevo.',
                    byStatus: {
                        400: 'Revisa el email y la contraseña.',
                        401: 'Email o contraseña incorrectos.',
                    },
                })
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-bone flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-sm">
                <div className="mb-8">
                    <Logo className="h-10" />
                </div>

                <h1 className="text-2xl font-semibold text-gray-900 mb-1">Iniciar sesión</h1>
                <p className="text-sm text-gray-500 mb-6">
                    Consulta qué alimentos son seguros para tus mascotas.
                </p>

                <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="mb-4">
                        <label htmlFor="login-email" className={LABEL}>
                            Email
                        </label>
                        <input
                            id="login-email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ana@correo.com"
                            required
                            className={INPUT}
                        />
                    </div>

                    <div className="mb-5">
                        <label htmlFor="login-password" className={LABEL}>
                            Contraseña
                        </label>
                        <input
                            id="login-password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className={INPUT}
                        />
                    </div>

                    {error && (
                        <p role="alert" className="text-sm text-risk-toxic mb-4">
                            {error}
                        </p>
                    )}

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