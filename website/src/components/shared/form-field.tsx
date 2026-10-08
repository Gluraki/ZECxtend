import { cn } from "cn"
import type { ReactNode } from "react"
import { Label } from "@/components/ui/label"

interface Props {
  id?: string
  label: ReactNode
  className?: string
  children: ReactNode
}

export function FormField({ id, label, className, children }: Props) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  )
}
