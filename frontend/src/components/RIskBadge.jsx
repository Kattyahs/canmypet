import { CheckCircle, AlertCircle, XCircle, Skull } from 'lucide-react'

export const RISK_CONFIG = {
    SAFE: {
        label: 'SAFE',
        Icon: CheckCircle,
        text: 'text-risk-safe',
        bg: 'bg-green-50',
        border: 'border-green-100',
        verdict: 'Sin riesgo conocido para esta especie.',
    },
    MODERATE: {
        label: 'MODERATE',
        Icon: AlertCircle,
        text: 'text-risk-moderate',
        bg: 'bg-amber-50',
        border: 'border-amber-100',
        verdict: 'Ocasional y controlado. Evita darlo con frecuencia.',
    },
    TOXIC: {
        label: 'TOXIC',
        Icon: XCircle,
        text: 'text-risk-toxic',
        bg: 'bg-red-50',
        border: 'border-red-100',
        verdict: 'No debe comerlo. Puede provocar intoxicación.',
    },
    LETHAL: {
        label: 'LETHAL',
        Icon: Skull,
        text: 'text-risk-lethal',
        bg: 'bg-red-100',
        border: 'border-red-200',
        verdict: 'Urgencia inmediata. Contacta a un veterinario.',
    },
}

function RiskBadge({ level, size = 'sm' }) {
    const config = RISK_CONFIG[level]
    if (!config) return null

    const { Icon, text, bg, border, label } = config

    return (
        <span
            className={`inline-flex items-center gap-1 rounded font-mono uppercase ${text} ${bg} ${border} border ${
                size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1'
            }`}
        >
      <Icon size={size === 'sm' ? 12 : 14} />
            {label}
    </span>
    )
}

export default RiskBadge