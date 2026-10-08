import { Check, Trash2 } from "lucide-react"
import { useState } from "react"
import { deletePenalty, updatePenaltyCount } from "@/api/penalties"
import { IconButton } from "@/components/shared/icon-button"
import { NumberInput } from "@/components/shared/number-input"
import { useAction } from "@/hooks/use-action"
import type { Penalty, PenaltyType } from "@/types/penalty"

interface Props {
  penalty: Penalty
  type: PenaltyType | undefined
  onChanged: () => void
}

export function PenaltyRow({ penalty, type, onChanged }: Props) {
  const [count, setCount] = useState<number | null>(penalty.count)
  const { pending, run } = useAction()
  const changed = count !== null && count !== penalty.count

  const save = async () => {
    if (count !== null && (await run(() => updatePenaltyCount(penalty.id, count), "Penalty updated"))) onChanged()
  }

  const remove = async () => {
    if (await run(() => deletePenalty(penalty.id), "Penalty removed")) onChanged()
  }

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 p-3">
      <span className="font-medium">
        {type?.type ?? `Penalty #${penalty.penalty_type_id}`}
        {type && <span className="ml-2 text-sm text-muted-foreground">+{type.amount} s each</span>}
      </span>
      <div className="flex items-center gap-1">
        <NumberInput className="w-20 bg-white" min={0} value={count} onChange={setCount} aria-label="Count" />
        <IconButton icon={Check} label="Save count" size="icon" onClick={save} disabled={!changed || pending} />
        <IconButton icon={Trash2} label="Remove penalty" size="icon" onClick={remove} disabled={pending} destructive />
      </div>
    </div>
  )
}
