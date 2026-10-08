export function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const rest = (seconds % 60).toFixed(3).padStart(6, "0")
  return `${minutes}:${rest}`
}

export function durationBetween(start: string, end: string) {
  return (new Date(end).getTime() - new Date(start).getTime()) / 1000
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString()
}

export function formatNumber(value: number, digits = 3) {
  return String(Number(value.toFixed(digits)))
}

export function toInputDateTime(value: string) {
  return value.slice(0, 23)
}

export function fromInputDateTime(value: string, original: string) {
  const [date, time = ""] = value.split("T")
  const [clock, millis = ""] = time.split(".")
  const seconds = clock.length === 5 ? `${clock}:00` : clock
  const micros = (original.split(".")[1] ?? "").slice(3, 6).padEnd(3, "0")
  return `${date}T${seconds}.${millis.padEnd(3, "0").slice(0, 3)}${micros}`
}
