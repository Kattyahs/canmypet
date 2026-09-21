import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ForbiddenPage from '../pages/ForbiddenPage'


function RoleRoute({ allowedRoles, children }) {
    const { user, loading } = useAuth()

    if (loading) return null
    if (!user) return <Navigate to="/login" replace />
    if (!allowedRoles.includes(user.role)) return <ForbiddenPage />

    return children ?? <Outlet />
}

export default RoleRoute