import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { getPageTitle, usePageTitle } from '../hooks/usePageTitle'

function OwnerLayout() {
    const { pathname } = useLocation()
    usePageTitle(getPageTitle(pathname))
    return (
        <div className="min-h-screen bg-bone md:flex">
            <Sidebar />
            <main className="flex-1 min-w-0 p-4 md:p-8 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-8">
                <Outlet />
            </main>
        </div>
    )
}

export default OwnerLayout