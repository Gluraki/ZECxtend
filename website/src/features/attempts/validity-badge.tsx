import { CheckCircle2, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Props {
  valid: boolean
}

export function ValidityBadge({ valid }: Props) {
  if (!valid) {
    return (
      <Badge variant="destructive">
        <XCircle className="mr-1 h-3 w-3" />
        Invalid
      </Badge>
    )
  }

  return (
    <Badge variant="default" className="bg-green-500">
      <CheckCircle2 className="mr-1 h-3 w-3" />
      Valid
    </Badge>
  )
}
