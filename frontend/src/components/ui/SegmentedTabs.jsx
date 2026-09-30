import { useRef } from 'react'

function SegmentedTabs({ options, value, onChange, label, idPrefix, panelId, className = '' }) {
    const buttonsRef = useRef([])

    const focusAt = (index) => {
        const target = (index + options.length) % options.length
        buttonsRef.current[target]?.focus()
        onChange(options[target].value)
    }

    const handleKeyDown = (event, index) => {
        if (event.key === 'ArrowRight') {
            event.preventDefault()
            focusAt(index + 1)
        } else if (event.key === 'ArrowLeft') {
            event.preventDefault()
            focusAt(index - 1)
        }
    }

    return (
        <div role="tablist" aria-label={label} className={`flex p-1 bg-bone rounded-xl gap-1 ${className}`}>
            {options.map((option, index) => {
                const selected = option.value === value
                const Icon = option.Icon
                return (
                    <button
                        key={option.value}
                        ref={(el) => {
                            buttonsRef.current[index] = el
                        }}
                        id={idPrefix ? `${idPrefix}-${option.value}` : undefined}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        aria-controls={panelId}
                        tabIndex={selected ? 0 : -1}
                        onClick={() => onChange(option.value)}
                        onKeyDown={(event) => handleKeyDown(event, index)}
                        className={`flex-1 inline-flex items-center justify-center gap-2 min-h-[40px] px-3 rounded-lg text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                            selected ? 'bg-brand-soft text-brand font-semibold' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {Icon && <Icon size={16} className="hidden sm:block" aria-hidden="true" />}
                        {option.shortLabel ? (
                            <>
                                <span className="sm:hidden">{option.shortLabel}</span>
                                <span className="hidden sm:inline">{option.label}</span>
                            </>
                        ) : (
                            option.label
                        )}
                        {option.count !== undefined && <span className="text-xs opacity-80">· {option.count}</span>}
                    </button>
                )
            })}
        </div>
    )
}

export default SegmentedTabs