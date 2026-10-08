import type { ComponentProps } from "react"
import { Input } from "@/components/ui/input"

interface Props extends Omit<ComponentProps<typeof Input>, "value" | "onChange" | "type"> {
  value: number | null
  onChange: (value: number | null) => void
}

export function NumberInput({ value, onChange, ...props }: Props) {
  return (
    <Input
      type="number"
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value === "" ? null : Number(event.target.value))}
      {...props}
    />
  )
}
