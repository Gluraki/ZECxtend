import { cn } from "cn"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  icon: LucideIcon
  label: string
  onClick: () => void
  destructive?: boolean
  disabled?: boolean
  size?: "sm" | "icon"
}

export function IconButton({ icon: Icon, label, onClick, destructive, disabled, size = "sm" }: Props) {
  return (
    <Button variant="ghost" size={size} onClick={onClick} disabled={disabled} aria-label={label} title={label}>
      <Icon className={cn("h-4 w-4", destructive && "text-destructive")} />
    </Button>
  )
}
