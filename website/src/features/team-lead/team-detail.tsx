import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

interface Props {
  icon?: LucideIcon
  label: string
  children: ReactNode
}

export function TeamDetail({ icon: Icon, label, children }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        {Icon && <Icon className="h-4 w-4" />}
        <span className="text-sm font-medium">{label}</span>
      </div>
      {children}
    </div>
  )
}
