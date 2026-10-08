import { Edit, Trash2 } from "lucide-react"
import { ActionsCell } from "@/components/shared/actions-cell"
import { IconButton } from "@/components/shared/icon-button"
import { TableCell, TableRow } from "@/components/ui/table"
import { ValidityBadge } from "@/features/attempts/validity-badge"
import { durationBetween, formatDateTime, formatDuration } from "@/lib/format"
import type { Attempt } from "@/types/attempt"

interface Props {
  attempt: Attempt
  teamName: string
  driverName: string
  onEdit: () => void
  onDelete: () => void
}

export function AttemptRow({ attempt, teamName, driverName, onEdit, onDelete }: Props) {
  return (
    <TableRow>
      <TableCell className="font-medium">{teamName}</TableCell>
      <TableCell>{driverName}</TableCell>
      <TableCell className="font-mono">
        {formatDuration(durationBetween(attempt.start_time, attempt.end_time))}
      </TableCell>
      <TableCell>{attempt.energy_used.toFixed(2)} Wh</TableCell>
      <TableCell className="text-sm">{formatDateTime(attempt.start_time)}</TableCell>
      <TableCell className="text-sm">{formatDateTime(attempt.end_time)}</TableCell>
      <TableCell>
        <ValidityBadge valid={attempt.is_valid} />
      </TableCell>
      <ActionsCell>
        <IconButton icon={Edit} label="Edit attempt" onClick={onEdit} />
        <IconButton icon={Trash2} label="Delete attempt" onClick={onDelete} destructive />
      </ActionsCell>
    </TableRow>
  )
}
