import { useState } from 'react'
import { ClipboardCheck, HelpCircle, Plus, ShieldAlert } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import PendingEntriesTab from '../components/vet/PendingEntriesTab'
import PendingQuestionsTab from '../components/vet/PendingQuestionsTab'
import ProposeEntryForm from '../components/vet/ProposeEntryForm'
import SegmentedTabs from '../components/ui/SegmentedTabs'

const TABS = [
    { value: 'entries', label: 'Entradas pendientes', shortLabel: 'Entradas', Icon: ClipboardCheck },
    { value: 'questions', label: 'Preguntas sin responder', shortLabel: 'Preguntas', Icon: HelpCircle },
]

function VetPanelPage() {
    const { user, refreshUser } = useAuth()
    const [activeTab, setActiveTab] = useState('entries')
    const [checking, setChecking] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [notice, setNotice] = useState('')
    const [entriesVersion, setEntriesVersion] = useState(0)

    const canAct = user?.verified === true

    const handleRecheck = async () => {
        setChecking(true)
        try {
            await refreshUser()
        } finally {
            setChecking(false)
        }
    }

    const handleCreated = () => {
        setShowForm(false)
        setActiveTab('entries')
        setEntriesVersion((v) => v + 1)
        setNotice('Entrada creada. Ya aparece en la lista de pendientes.')
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Panel veterinario</h1>
                    <p className="text-sm text-gray-500">
                        Verifica evaluaciones de riesgo y responde las preguntas de los dueños.
                    </p>
                </div>
                {!showForm && (
                    <button
                        type="button"
                        onClick={() => {
                            setNotice('')
                            setShowForm(true)
                        }}
                        disabled={!canAct}
                        className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 bg-brand text-white text-sm font-medium rounded-xl hover:bg-brand-dark disabled:opacity-60"
                    >
                        <Plus size={16} aria-hidden="true" />
                        Proponer entrada
                    </button>
                )}
            </div>

            {!canAct && (
                <div
                    role="status"
                    className="bg-amber-50 border border-amber-100 rounded-2xl p-4 md:p-5 mb-6 flex flex-col md:flex-row md:items-center gap-3"
                >
                    <ShieldAlert size={20} className="text-risk-moderate shrink-0" aria-hidden="true" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                            Tu cuenta está pendiente de aprobación
                        </p>
                        <p className="text-sm text-gray-600">
                            Un administrador debe verificar tu licencia antes de que puedas verificar
                            entradas, proponer nuevas o responder preguntas.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleRecheck}
                        disabled={checking}
                        className="min-h-[44px] px-4 border border-gray-200 bg-white text-sm font-medium rounded-xl text-gray-700 disabled:opacity-60"
                    >
                        {checking ? 'Comprobando...' : 'Comprobar de nuevo'}
                    </button>
                </div>
            )}

            {notice && (
                <p role="status" className="bg-green-50 border border-green-100 rounded-xl p-3 mb-4 text-sm text-gray-900">
                    {notice}
                </p>
            )}

            {showForm && canAct && (
                <ProposeEntryForm onCreated={handleCreated} onCancel={() => setShowForm(false)} />
            )}

            <SegmentedTabs
                options={TABS}
                value={activeTab}
                onChange={setActiveTab}
                label="Secciones del panel"
                idPrefix="tab"
                panelId="panel-content"
                className="mb-5 md:max-w-xl"
            />

            <div role="tabpanel" id="panel-content" aria-labelledby={`tab-${activeTab}`}>
                {activeTab === 'entries' ? (
                    <PendingEntriesTab key={entriesVersion} canAct={canAct} />
                ) : (
                    <PendingQuestionsTab canAct={canAct} />
                )}
            </div>
        </div>
    )
}

export default VetPanelPage