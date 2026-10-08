import type { ReactNode } from "react"
import { TableCell } from "@/components/ui/table"

interface Props {
  children: ReactNode
}

export function ActionsCell({ children }: Props) {
  return (
    <TableCell className="text-right">
      <div className="flex justify-end gap-2">{children}</div>
    </TableCell>
  )
}
