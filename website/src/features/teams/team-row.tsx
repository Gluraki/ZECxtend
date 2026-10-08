import { Edit, Trash2, Users } from "lucide-react"
import { useState } from "react"
import { ActionsCell } from "@/components/shared/actions-cell"
import { IconButton } from "@/components/shared/icon-button"
import { Badge } from "@/components/ui/badge"
import { TableCell, TableRow } from "@/components/ui/table"
import { TeamDriversRow } from "@/features/teams/team-drivers-row"
import { CATEGORY_LABELS } from "@/lib/labels"
import type { Team } from "@/types/team"

interface Props {
  team: Team
  colSpan: number
  onEdit: () => void
  onDelete: () => void
}

export function TeamRow({ team, colSpan, onEdit, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">{team.name}</TableCell>
        <TableCell>
          <Badge variant="outline">{CATEGORY_LABELS[team.category]}</Badge>
        </TableCell>
        <TableCell>{team.vehicle_weight}</TableCell>
        <TableCell>{team.mean_power}</TableCell>
        <TableCell className="font-mono text-sm">{team.rfid_identifier}</TableCell>
        <ActionsCell>
          <IconButton icon={Users} label="Show drivers" onClick={() => setExpanded(!expanded)} />
          <IconButton icon={Edit} label="Edit team" onClick={onEdit} />
          <IconButton icon={Trash2} label="Delete team" onClick={onDelete} destructive />
        </ActionsCell>
      </TableRow>
      {expanded && <TeamDriversRow teamId={team.id} colSpan={colSpan} />}
    </>
  )
}
