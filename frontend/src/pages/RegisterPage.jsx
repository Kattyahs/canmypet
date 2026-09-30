import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BadgeCheck, Lock, Mail, PawPrint, Stethoscope, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import axiosClient from '../api/axiosClient'
import AuthLayout from '../components/auth/AuthLayout'
import AuthField from '../components/auth/AuthField'
import Button from '../components/ui/Button'
import { usePageTitle } from '../hooks/usePageTitle'
import { getApiErrorMessage } from '../utils/apiError'

const ROLES = [
    {
        value: 'OWNER',
        label: 'Dueño de mascota',
        description: 'Consulta alimentos y guarda a tus mascotas.',
        Icon: PawPrint,
    },
    {
        value: 'VETERINARIAN',
        label: 'Veterinario',
        description: 'Revisa evaluaciones y responde preguntas.',
        Icon: Stethoscope,
    },
]

function RegisterPage() {
    usePageTitle('Crear cuenta')
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
            navigate('/')
        } catch (err) {
            setError(
                getApiErrorMessage(err, {
                    fallback: 'No se pudo crear la cuenta. Intenta de nuevo.',
                    byStatus: {
                        400: 'Revisa los datos: la contraseña debe tener al menos 8 caracteres.',
                        409: 'Ya existe una cuenta con ese email.',
                    },
                })
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout
            title="Crea tu cuenta"
            subtitle="Empieza a consultar qué alimentos son seguros para tus mascotas."
            footer={
                <>
                    ¿Ya tienes cuenta?{' '}
                    <Link to="/login" className="font-semibold text-brand hover:underline">
                        Iniciar sesión
                    </Link>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <fieldset>
                    <legend className="block text-sm font-medium text-gray-700 mb-1.5">Tipo de cuenta</legend>
                    <div className="grid grid-cols-2 gap-2">
                        {ROLES.map(({ value, label, description, Icon }) => {
                            const selected = role === value
                            return (
                                <label
                                    key={value}
                                    className={`relative flex flex-col gap-1 p-3 rounded-xl border cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-brand ${
                                        selected ? 'border-brand bg-brand-soft' : 'border-gray-200 hover:bg-bone'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="role"
                                        value={value}
                                        checked={selected}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="sr-only"
                                    />
                                    <Icon size={20} className={selected ? 'text-brand' : 'text-gray-400'} aria-hidden="true" />
                                    <span className={`text-sm font-semibold ${selected ? 'text-brand' : 'text-gray-900'}`}>
                                        {label}
                                    </span>
                                    <span className="text-xs leading-snug text-gray-500">{description}</span>
                                </label>
                            )
                        })}
                    </div>
                </fieldset>

                <AuthField
                    id="register-name"
                    label="Nombre completo"
                    icon={User}
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ana Pérez"
                    required
                />
                <AuthField
                    id="register-email"
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
                    id="register-password"
                    label="Contraseña"
                    icon={Lock}
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    minLength={8}
                    required
                />

                {role === 'VETERINARIAN' && (
                    <AuthField
                        id="register-license"
                        label="Número de licencia profesional"
                        icon={BadgeCheck}
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        placeholder="VET-2026-00341"
                        hint="Un administrador verificará tu licencia antes de activar el panel veterinario."
                        required
                    />
                )}

                {error && (
                    <p role="alert" className="text-sm text-risk-toxic">
                        {error}
                    </p>
                )}

                <Button type="submit" size="lg" fullWidth disabled={loading} className="mt-2">
                    {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                </Button>

                <p className="text-xs text-center text-gray-400">
                    CanMyPet? ofrece orientación informativa y no sustituye una consulta veterinaria.
                </p>
            </form>
        </AuthLayout>
    )
}

export default RegisterPage