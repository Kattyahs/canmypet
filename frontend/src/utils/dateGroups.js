const dayKey = (date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`

const DAY_FORMAT = new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'long' })
const DAY_WITH_YEAR_FORMAT = new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
const TIME_FORMAT = new Intl.DateTimeFormat('es-CL', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })

export function dayLabel(date, now = new Date()) {
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    if (dayKey(date) === dayKey(now)) return 'Hoy'
    if (dayKey(date) === dayKey(yesterday)) return 'Ayer'
    const format = date.getFullYear() === now.getFullYear() ? DAY_FORMAT : DAY_WITH_YEAR_FORMAT
    return format.format(date)
}

export const timeLabel = (isoString) => (isoString ? TIME_FORMAT.format(new Date(isoString)) : '')

export function groupByDay(items, getDate, now = new Date()) {
    const groups = []
    for (const item of items) {
        const iso = getDate(item)
        const date = iso ? new Date(iso) : null
        const key = date ? dayKey(date) : 'sin-fecha'
        const last = groups[groups.length - 1]
        if (last && last.key === key) {
            last.items.push(item)
        } else {
            groups.push({ key, label: date ? dayLabel(date, now) : 'Sin fecha', items: [item] })
        }
    }
    return groups
}