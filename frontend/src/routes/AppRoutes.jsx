import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import DashboardPage from '../pages/DashboardPage'
import PetsPage from "../pages/PetsPage.jsx";
import OwnerLayout from '../layouts/OwnerLayout'
import SearchPage from '../pages/SearchPage'
import HistoryPage from '../pages/HistoryPage'
import FaqPage from '../pages/FaqPage'
import EmergencyPage from '../pages/EmergencyPage'
import RoleRoute from './RoleRoute'
import VetPanelPage from '../pages/VetPanelPage'
import AdminPanelPage from '../pages/AdminPanelPage'

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth()

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return children
}

function PublicRoute({ children }) {
    const { user, loading } = useAuth()

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
    }

    if (user) {
        return <Navigate to="/dashboard" replace />
    }

    return children
}

function AppRoutes() {
    return (
        <Routes>
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <LoginPage />
                    </PublicRoute>
                }
            />
            <Route
                path="/register"
                element={
                    <PublicRoute>
                        <RegisterPage />
                    </PublicRoute>
                }
            />

            <Route
                element={
                    <ProtectedRoute>
                        <OwnerLayout  />
                    </ProtectedRoute>
                }
            >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/pets" element={<PetsPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/emergency" element={<EmergencyPage />} />
                <Route path="/emergency/:riskLevel" element={<EmergencyPage />} />

                <Route element={<RoleRoute allowedRoles={['VETERINARIAN']} />}>
                    <Route path="/vet" element={<VetPanelPage />} />
                </Route>


                <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
                    <Route path="/admin" element={<AdminPanelPage />} />
                </Route>

            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    )
}

export default AppRoutes