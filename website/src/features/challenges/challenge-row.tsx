import { Edit } from "lucide-react"
import { ActionsCell } from "@/components/shared/actions-cell"
import { IconButton } from "@/components/shared/icon-button"
import { TableCell, TableRow } from "@/components/ui/table"
import { SCORING_TYPE_LABELS } from "@/lib/labels"
import type { Challenge } from "@/types/challenge"

function joinMacs(...macs: (string | null)[]) {
  return macs.filter(Boolean).join(", ") || "—"
}

interface Props {
  challenge: Challenge
  onEdit: () => void
}

export function ChallengeRow({ challenge, onEdit }: Props) {
  return (
    <TableRow>
      <TableCell className="font-medium">{challenge.name}</TableCell>
      <TableCell>{challenge.scoring_type ? SCORING_TYPE_LABELS[challenge.scoring_type] : "—"}</TableCell>
      <TableCell>{challenge.max_attempts ?? "—"}</TableCell>
      <TableCell>{joinMacs(challenge.esp_mac_start1, challenge.esp_mac_start2)}</TableCell>
      <TableCell>{joinMacs(challenge.esp_mac_finish1, challenge.esp_mac_finish2)}</TableCell>
      <ActionsCell>
        <IconButton icon={Edit} label="Edit challenge" onClick={onEdit} />
      </ActionsCell>
    </TableRow>
  )
}
