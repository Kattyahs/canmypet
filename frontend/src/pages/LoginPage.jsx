import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import axiosClient from '../api/axiosClient'
import AuthLayout from '../components/auth/AuthLayout'
import AuthField from '../components/auth/AuthField'
import Button from '../components/ui/Button'
import { usePageTitle } from '../hooks/usePageTitle'
import { getApiErrorMessage } from '../utils/apiError'

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
        <AuthLayout
            title="Qué bueno verte"
            subtitle="Inicia sesión para seguir cuidando lo que comen tus mascotas."
            footer={
                <>
                    ¿No tienes cuenta?{' '}
                    <Link to="/register" className="font-semibold text-brand hover:underline">
                        Crear cuenta
                    </Link>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <AuthField
                    id="login-email"
                    label="Email"
                    icon={Mail}
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    required
                />
                <AuthField
                    id="login-password"
                    label="Contraseña"
                    icon={Lock}
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                />

                {error && (
                    <p role="alert" className="text-sm text-risk-toxic">
                        {error}
                    </p>
                )}

                <Button type="submit" size="lg" fullWidth disabled={loading} className="mt-2">
                    {loading ? 'Entrando...' : 'Iniciar sesión'}
                </Button>
            </form>
        </AuthLayout>
    )
}

export default LoginPage