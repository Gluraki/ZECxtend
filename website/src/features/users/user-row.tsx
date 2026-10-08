import { Edit, Trash2 } from "lucide-react"
import { ActionsCell } from "@/components/shared/actions-cell"
import { IconButton } from "@/components/shared/icon-button"
import { Badge } from "@/components/ui/badge"
import { TableCell, TableRow } from "@/components/ui/table"
import { ROLE_LABELS } from "@/lib/labels"
import type { User } from "@/types/user"

interface Props {
  user: User
  teamName: string | undefined
  onEdit: () => void
  onDelete: () => void
}

export function UserRow({ user, teamName, onEdit, onDelete }: Props) {
  return (
    <TableRow>
      <TableCell className="font-medium">{user.username}</TableCell>
      <TableCell>{teamName ?? "N/A"}</TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline">{ROLE_LABELS[user.role]}</Badge>
          {user.must_change_password && <Badge variant="secondary">Password change pending</Badge>}
        </div>
      </TableCell>
      <ActionsCell>
        <IconButton icon={Edit} label="Edit user" onClick={onEdit} />
        <IconButton icon={Trash2} label="Delete user" onClick={onDelete} destructive />
      </ActionsCell>
    </TableRow>
  )
}
