import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getHomePath } from './homePath'

function HomeRedirect() {
    const { user } = useAuth()
    return <Navigate to={getHomePath(user?.role)} replace />
}

export default HomeRedirect