import { cn } from "cn"
import { Loader2 } from "lucide-react"

interface Props {
  className?: string
}

export function LoadingState({ className }: Props) {
  return (
    <div className={cn("flex items-center justify-center py-8", className)}>
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}
