import { Plus } from "lucide-react"
import { useState } from "react"
import { createPenalty, listPenalties, listPenaltyTypes } from "@/api/penalties"
import { LoadingButton } from "@/components/shared/loading-button"
import { NumberInput } from "@/components/shared/number-input"
import { OptionSelect } from "@/components/shared/option-select"
import { Label } from "@/components/ui/label"
import { PenaltyRow } from "@/features/attempts/penalty-row"
import { useAction } from "@/hooks/use-action"
import { useApiData } from "@/hooks/use-api-data"

interface Props {
  attemptId: number
}

export function AttemptPenalties({ attemptId }: Props) {
  const types = useApiData(listPenaltyTypes, [], [])
  const penalties = useApiData(() => listPenalties(attemptId), [], [attemptId])
  const [typeId, setTypeId] = useState<string>()
  const [count, setCount] = useState<number | null>(1)
  const { pending, run } = useAction()

  const add = async () => {
    const penalty = { attempt_id: attemptId, penalty_type_id: Number(typeId), count: count ?? 1 }
    if (await run(() => createPenalty(penalty), "Penalty added")) {
      setCount(1)
      penalties.reload()
    }
  }

  return (
    <div className="space-y-3 border-t pt-4">
      <Label>Penalties</Label>
      {!penalties.loading && penalties.data.length === 0 && (
        <p className="text-sm text-muted-foreground">No penalties for this attempt</p>
      )}
      {penalties.data.map((penalty) => (
        <PenaltyRow
          key={`${penalty.id}-${penalty.count}`}
          penalty={penalty}
          type={types.data.find((type) => type.id === penalty.penalty_type_id)}
          onChanged={penalties.reload}
        />
      ))}
      <div className="flex items-center gap-2">
        <OptionSelect
          value={typeId}
          options={types.data.map((type) => ({ value: String(type.id), label: `${type.type} (+${type.amount} s)` }))}
          onChange={setTypeId}
          placeholder="Select penalty type"
          className="flex-1"
        />
        <NumberInput className="w-20" min={1} value={count} onChange={setCount} aria-label="Count" />
        <LoadingButton variant="outline" loading={pending} disabled={!typeId} onClick={add}>
          {!pending && <Plus className="h-4 w-4" />}
          Add
        </LoadingButton>
      </div>
    </div>
  )
}
