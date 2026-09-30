import { useState } from 'react'
import { UserCheck, Apple, LifeBuoy } from 'lucide-react'
import PendingVeterinariansTab from '../components/admin/PendingVeterinariansTab'
import FoodsTab from '../components/admin/FoodsTab'
import EmergencyGuidesTab from '../components/admin/EmergencyGuidesTab'
import SegmentedTabs from '../components/ui/SegmentedTabs'

const TABS = [
    { value: 'veterinarians', label: 'Veterinarios', Icon: UserCheck },
    { value: 'foods', label: 'Alimentos', Icon: Apple },
    { value: 'guides', label: 'Guías', Icon: LifeBuoy },
]

function AdminPanelPage() {
    const [activeTab, setActiveTab] = useState('veterinarians')

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Administración</h1>
                <p className="text-sm text-gray-500">
                    Aprueba veterinarios y mantén el catálogo de alimentos y las guías de emergencia.
                </p>
            </div>

            <SegmentedTabs
                options={TABS}
                value={activeTab}
                onChange={setActiveTab}
                label="Secciones de administración"
                idPrefix="tab"
                panelId="panel-content"
                className="mb-5 md:max-w-xl"
            />

            <div role="tabpanel" id="panel-content" aria-labelledby={`tab-${activeTab}`}>
                {activeTab === 'veterinarians' && <PendingVeterinariansTab />}
                {activeTab === 'foods' && <FoodsTab />}
                {activeTab === 'guides' && <EmergencyGuidesTab />}
            </div>
        </div>
    )
}

export default AdminPanelPage