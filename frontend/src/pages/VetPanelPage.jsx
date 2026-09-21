import { useState } from 'react'
import { ClipboardCheck, HelpCircle, ShieldAlert } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import PendingEntriesTab from '../components/vet/PendingEntriesTab'
import PendingQuestionsTab from '../components/vet/PendingQuestionsTab'

const TABS = [
    { id: 'entries', label: 'Entradas pendientes', Icon: ClipboardCheck },
    { id: 'questions', label: 'Preguntas sin responder', Icon: HelpCircle },
]

function VetPanelPage() {
    const { user, refreshUser } = useAuth()
    const [activeTab, setActiveTab] = useState('entries')
    const [checking, setChecking] = useState(false)

    // UX only: the backend rejects actions from unverified veterinarians anyway
    const canAct = user?.verified === true

    const handleRecheck = async () => {
        setChecking(true)
        try {
            await refreshUser()
        } finally {
            setChecking(false)
        }
    }

    return (
        <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Panel veterinario</h1>
            <p className="text-sm text-gray-500 mb-6">
                Verifica evaluaciones de riesgo y responde las preguntas de los dueños.
            </p>

            {!canAct && (
                <div
                    role="status"
                    className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-6 flex flex-col md:flex-row md:items-center gap-3"
                >
                    <ShieldAlert size={20} className="text-risk-moderate shrink-0" aria-hidden="true" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                            Tu cuenta está pendiente de aprobación
                        </p>
                        <p className="text-sm text-gray-600">
                            Un administrador debe verificar tu licencia antes de que puedas verificar
                            entradas o responder preguntas.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleRecheck}
                        disabled={checking}
                        className="min-h-[44px] px-4 border border-gray-300 bg-white text-sm font-medium rounded-md text-gray-700 disabled:opacity-60"
                    >
                        {checking ? 'Comprobando...' : 'Comprobar de nuevo'}
                    </button>
                </div>
            )}

            <div role="tablist" aria-label="Secciones del panel" className="flex gap-1 border-b border-gray-200 mb-4">
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
                {activeTab === 'entries' ? (
                    <PendingEntriesTab canAct={canAct} />
                ) : (
                    <PendingQuestionsTab canAct={canAct} />
                )}
            </div>
        </div>
    )
}

export default VetPanelPage