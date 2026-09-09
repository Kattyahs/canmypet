import { useAuth } from './context/AuthContext'

function App() {
    const { user, loading } = useAuth()

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800">CanMyPet</h1>
                <p className="mt-4 text-gray-600">
                    {loading ? 'Cargando...' : user ? `Hola, ${user.name}` : 'No hay sesión activa'}
                </p>
            </div>
        </div>
    )
}

export default App