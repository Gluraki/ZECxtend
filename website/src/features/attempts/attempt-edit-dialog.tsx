import { useState } from "react"
import { setAttemptValidity, updateAttempt } from "@/api/attempts"
import { FormDialog } from "@/components/shared/form-dialog"
import { FormField } from "@/components/shared/form-field"
import { NumberInput } from "@/components/shared/number-input"
import { OptionSelect } from "@/components/shared/option-select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AttemptPenalties } from "@/features/attempts/attempt-penalties"
import { fromInputDateTime, toInputDateTime } from "@/lib/format"
import type { Attempt, AttemptUpdate } from "@/types/attempt"

const VALIDITY_OPTIONS = [
  { value: "true", label: "✓ Valid" },
  { value: "false", label: "✗ Invalid" },
] as const

interface Props {
  attempt: Attempt
  teamName: string
  driverName: string
  onSaved: () => void
  onClose: () => void
}

export function AttemptEditDialog({ attempt, teamName, driverName, onSaved, onClose }: Props) {
  const [startTime, setStartTime] = useState(toInputDateTime(attempt.start_time))
  const [endTime, setEndTime] = useState(toInputDateTime(attempt.end_time))
  const [energy, setEnergy] = useState<number | null>(attempt.energy_used)
  const [valid, setValid] = useState(attempt.is_valid)

  const submit = async () => {
    const update: AttemptUpdate = {}
    if (startTime !== toInputDateTime(attempt.start_time)) {
      update.start_time = fromInputDateTime(startTime, attempt.start_time)
    }
    if (endTime !== toInputDateTime(attempt.end_time)) {
      update.end_time = fromInputDateTime(endTime, attempt.end_time)
    }
    if (energy !== null && energy !== attempt.energy_used) update.energy_used = energy
    if (Object.keys(update).length > 0) await updateAttempt(attempt.id, update)
    if (valid !== attempt.is_valid) await setAttemptValidity(attempt.id, valid)
  }

  return (
    <FormDialog
      title="Edit Attempt"
      submitLabel="Update Attempt"
      successMessage="Attempt updated successfully"
      className="max-h-[90vh] overflow-y-auto"
      onSubmit={submit}
      onSaved={onSaved}
      onClose={onClose}
    >
      <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4">
        <div>
          <Label className="text-muted-foreground">Team</Label>
          <p className="font-medium">{teamName}</p>
        </div>
        <div>
          <Label className="text-muted-foreground">Driver</Label>
          <p className="font-medium">{driverName}</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="start_time" label="Start Time">
          <Input
            id="start_time"
            type="datetime-local"
            step="0.001"
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
          />
        </FormField>
        <FormField id="end_time" label="End Time">
          <Input
            id="end_time"
            type="datetime-local"
            step="0.001"
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
          />
        </FormField>
      </div>
      <FormField id="energy_used" label="Energy Used (Wh)">
        <NumberInput id="energy_used" step="0.01" value={energy} onChange={setEnergy} />
      </FormField>
      <FormField id="is_valid" label="Validity Status">
        <OptionSelect
          id="is_valid"
          value={String(valid) as "true" | "false"}
          options={[...VALIDITY_OPTIONS]}
          onChange={(value) => setValid(value === "true")}
          className="w-full"
        />
      </FormField>
      <AttemptPenalties attemptId={attempt.id} />
    </FormDialog>
  )
}
