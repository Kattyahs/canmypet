const RISK_SEVERITY = { LETHAL: 4, TOXIC: 3, MODERATE: 2, SAFE: 1 }

export const sortBySeverity = (entries) =>
    [...entries].sort(
        (a, b) =>
            (RISK_SEVERITY[b.riskLevel] ?? 0) - (RISK_SEVERITY[a.riskLevel] ?? 0) ||
            String(a.species).localeCompare(String(b.species)) ||
            (a.lifeStage ? 1 : 0) - (b.lifeStage ? 1 : 0)
    )

export function resolveEntry(entries, species, lifeStage) {
    const forSpecies = entries.filter((e) => e.species === species)
    const specific = lifeStage ? forSpecies.find((e) => e.lifeStage === lifeStage) : null
    const general = forSpecies.find((e) => !e.lifeStage)
    return {
        entry: specific ?? general ?? null,
        usedGeneralForStage: Boolean(lifeStage && !specific && general),
        speciesEntries: forSpecies,
    }
}

export const isSafeUrl = (url) => /^https?:\/\//i.test(url ?? '')