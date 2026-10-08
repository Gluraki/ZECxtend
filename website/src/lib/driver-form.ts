export interface DriverFormValues {
  name: string
  weight: number | null
}

export const EMPTY_DRIVER_FORM: DriverFormValues = { name: "", weight: null }

export function driverPayload(values: DriverFormValues) {
  if (!values.name.trim()) throw new Error("Driver name is required")
  if (!values.weight) throw new Error("Driver weight must be greater than 0")
  return { name: values.name.trim(), weight: values.weight }
}
