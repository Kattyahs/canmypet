import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axiosClient from '../api/axiosClient'

const ROLES = [
    {
        value: 'OWNER',
        label: 'Dueño de mascota',
        description: 'Consulta alimentos, gestiona tus mascotas y su historial.',
    },
    {
        value: 'VETERINARIAN',
        label: 'Veterinario',
        description: 'Verifica entradas de seguridad alimentaria y responde el FAQ.',
    },
]

function RegisterPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('OWNER')
    const [licenseNumber, setLicenseNumber] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const payload = { name, email, password, role }
            if (role === 'VETERINARIAN') {
                payload.licenseNumber = licenseNumber
            }
            const response = await axiosClient.post('/api/auth/register', payload)
            await login(response.data.token)
            navigate('/dashboard')
        } catch (err) {
            setError(
                err.response?.data?.error || 'No se pudo crear la cuenta. Intenta de nuevo.'
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-bone flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-sm">
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-6 h-6 rounded bg-brand" />
                    <span className="font-semibold text-gray-900">CanMyPet</span>
                </div>

                <h1 className="text-2xl font-semibold text-gray-900 mb-1">Crear cuenta</h1>
                <p className="text-sm text-gray-500 mb-6">Elige el tipo de cuenta que necesitas.</p>

                <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="mb-4">
                        <label className="block font-mono text-xs uppercase tracking-wide text-gray-500 mb-1.5">
                            Nombre completo
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ana Pérez"
                            required
                            className="w-full min-h-[44px] px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                        />
                    </div>

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
                        <label className="block font-mono text-xs uppercase tracking-wide text-gray-500 mb-1.5">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mínimo 8 caracteres"
                            minLength={8}
                            required
                            className="w-full min-h-[44px] px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block font-mono text-xs uppercase tracking-wide text-gray-500 mb-2">
                            Tipo de cuenta
                        </label>
                        <div className="space-y-2">
                            {ROLES.map((r) => (
                                <label
                                    key={r.value}
                                    className={`flex items-start gap-3 p-3 border rounded-md cursor-pointer ${
                                        role === r.value ? 'border-brand ring-1 ring-brand' : 'border-gray-200'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="role"
                                        value={r.value}
                                        checked={role === r.value}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="mt-1"
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{r.label}</p>
                                        <p className="text-xs text-gray-500">{r.description}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {role === 'VETERINARIAN' && (
                        <div className="mb-4 p-3 bg-bone border border-gray-200 rounded-md">
                            <label className="block font-mono text-xs uppercase tracking-wide text-brand mb-1.5">
                                Número de licencia profesional
                            </label>
                            <input
                                type="text"
                                value={licenseNumber}
                                onChange={(e) => setLicenseNumber(e.target.value)}
                                placeholder="VET-2026-00341"
                                required
                                className="w-full min-h-[44px] px-3 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand"
                            />
                            <p className="text-xs text-gray-500 mt-1.5">
                                Un administrador verificará tu licencia antes de activar el panel veterinario.
                            </p>
                        </div>
                    )}

                    {error && <p className="text-sm text-risk-toxic mb-4">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full min-h-[44px] bg-brand text-white text-sm font-medium rounded-md hover:opacity-90 disabled:opacity-60"
                    >
                        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                    </button>

                    <p className="text-xs text-gray-400 text-center mt-4">
                        CanMyPet ofrece orientación informativa y no sustituye una consulta veterinaria.
                    </p>
                </form>

                <p className="text-center text-sm text-gray-500 mt-4">
                    ¿Ya tienes cuenta?{' '}
                    <Link to="/login" className="text-brand font-medium">
                        Iniciar sesión
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default RegisterPage