import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

function OwnerLayout() {
    return (
        <div className="min-h-screen bg-bone md:flex">
            <Sidebar />
            <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
                <Outlet />
            </main>
        </div>
    )
}

export default OwnerLayout