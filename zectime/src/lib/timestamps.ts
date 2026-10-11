const MICROS_PER_SECOND = 1_000_000

const pad = (value: number, length = 2) => String(value).padStart(length, "0")

/** MACs come as `AA:BB:..` from the API and `AA-BB-..` from the ESPs, so compare without separators. */
export const normalizeMac = (mac: string | null | undefined) => (mac ?? "").replace(/[^0-9a-f]/gi, "").toUpperCase()

export const medianMicros = (values: number[]): number | null => {
    if (values.length === 0) return null

    const sorted = [...values].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)

    if (sorted.length % 2 === 0) {
        return Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    }

    return sorted[mid]
}

const subSecondMicros = (micros: number) =>
    ((micros % MICROS_PER_SECOND) + MICROS_PER_SECOND) % MICROS_PER_SECOND

/** Wall-clock part of a timestamp: `HH:MM:SS.ffffff`. */
export const formatClock = (micros: number) => {
    const date = new Date(Math.floor(micros / 1000))
    return `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}.${pad(subSecondMicros(micros), 6)}`
}

/** Naive `YYYY-MM-DDTHH:MM:SS.ffffff`, the format the API expects. */
export const toApiDateTime = (micros: number) => {
    const date = new Date(Math.floor(micros / 1000))
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}T${formatClock(micros)}`
}

/** Duration as `HH:MM:SS:mmm`. */
export const formatDuration = (micros: number) => {
    const ms = Math.floor(micros / 1000)
    const hours = Math.floor(ms / 3_600_000)
    const minutes = Math.floor((ms % 3_600_000) / 60_000)
    const seconds = Math.floor((ms % 60_000) / 1000)
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(ms % 1000, 3)}`
}

/** Parses the manual `HH:MM:SS` / `MM:SS` input into µs. */
export const durationToMicros = (time: string) => {
    const parts = time.split(":").map(Number)
    const [hh, mm, ss] = parts.length === 2 ? [0, ...parts] : parts
    return ((hh * 60 + mm) * 60 + ss) * MICROS_PER_SECOND
}

export const secondsToMicros = (seconds: number) => seconds * MICROS_PER_SECOND
