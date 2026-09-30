import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { getPageTitle, usePageTitle } from '../hooks/usePageTitle'

function OwnerLayout() {
    const { pathname } = useLocation()
    usePageTitle(getPageTitle(pathname))
    return (
        <div className="min-h-screen bg-bone md:flex">
            <Sidebar />
            <main className="flex-1 min-w-0 px-4 py-5 md:px-10 md:py-8 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-10">
                <div className="max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}

export default OwnerLayout