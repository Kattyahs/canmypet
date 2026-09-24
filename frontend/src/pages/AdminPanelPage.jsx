import { useState } from 'react'
import { UserCheck } from 'lucide-react'
import PendingVeterinariansTab from '../components/admin/PendingVeterinariansTab'

const TABS = [{ id: 'veterinarians', label: 'Veterinarios', Icon: UserCheck }]

function AdminPanelPage() {
    const [activeTab, setActiveTab] = useState('veterinarians')

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">Administración</h1>
                <p className="text-sm text-gray-500">
                    Aprueba veterinarios y mantén el catálogo de alimentos y las guías de emergencia.
                </p>
            </div>

            <div role="tablist" aria-label="Secciones de administración" className="flex gap-1 border-b border-gray-200 mb-4">
                {TABS.map(({ id, label, Icon }) => {
                    const selected = activeTab === id
                    return (
                        <button
                            key={id}
                            id={`tab-${id}`}
                            type="button"
                            role="tab"
                            aria-selected={selected}
                            aria-controls={`panel-${id}`}
                            onClick={() => setActiveTab(id)}
                            className={`flex items-center gap-2 min-h-[44px] px-3 text-sm -mb-px border-b-2 ${
                                selected
                                    ? 'border-brand text-brand font-medium'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <Icon size={16} aria-hidden="true" />
                            {label}
                        </button>
                    )
                })}
            </div>

            <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
                {activeTab === 'veterinarians' && <PendingVeterinariansTab />}
            </div>
        </div>
    )
}

export default AdminPanelPage