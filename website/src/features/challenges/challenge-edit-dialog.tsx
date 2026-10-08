import { useState } from "react"
import { updateChallenge } from "@/api/challenges"
import { FormDialog } from "@/components/shared/form-dialog"
import { FormField } from "@/components/shared/form-field"
import { NumberInput } from "@/components/shared/number-input"
import { OptionSelect } from "@/components/shared/option-select"
import { Input } from "@/components/ui/input"
import { SCORING_TYPE_LABELS } from "@/lib/labels"
import type { Challenge, ChallengeUpdate, ScoringType } from "@/types/challenge"

const MAC_FIELDS = [
  { key: "esp_mac_start1", label: "Start MAC 1" },
  { key: "esp_mac_start2", label: "Start MAC 2" },
  { key: "esp_mac_finish1", label: "Finish MAC 1" },
  { key: "esp_mac_finish2", label: "Finish MAC 2" },
] as const

const SCORING_OPTIONS = Object.entries(SCORING_TYPE_LABELS).map(([value, label]) => ({
  value: value as ScoringType,
  label,
}))

interface Props {
  challenge: Challenge
  onSaved: () => void
  onClose: () => void
}

export function ChallengeEditDialog({ challenge, onSaved, onClose }: Props) {
  const [form, setForm] = useState<ChallengeUpdate>({
    name: challenge.name,
    max_attempts: challenge.max_attempts,
    scoring_type: challenge.scoring_type,
    esp_mac_start1: challenge.esp_mac_start1,
    esp_mac_start2: challenge.esp_mac_start2,
    esp_mac_finish1: challenge.esp_mac_finish1,
    esp_mac_finish2: challenge.esp_mac_finish2,
  })

  return (
    <FormDialog
      title="Edit Challenge"
      submitLabel="Update Challenge"
      successMessage="Challenge updated successfully"
      onSubmit={() => updateChallenge(challenge.id, form)}
      onSaved={onSaved}
      onClose={onClose}
    >
      <FormField id="edit-name" label="Challenge Name">
        <Input
          id="edit-name"
          value={form.name ?? ""}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          placeholder="Enter challenge name"
        />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField id="edit-max-attempts" label="Max Attempts">
          <NumberInput
            id="edit-max-attempts"
            min={1}
            value={form.max_attempts ?? null}
            onChange={(value) => setForm({ ...form, max_attempts: value })}
            placeholder="Leave empty for unlimited"
          />
        </FormField>
        <FormField id="edit-scoring-type" label="Scoring Type">
          <OptionSelect
            id="edit-scoring-type"
            value={form.scoring_type ?? undefined}
            options={SCORING_OPTIONS}
            onChange={(value) => setForm({ ...form, scoring_type: value })}
            placeholder="Select scoring type"
            className="w-full"
          />
        </FormField>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {MAC_FIELDS.map(({ key, label }) => (
          <FormField key={key} id={`edit-${key}`} label={label}>
            <Input
              id={`edit-${key}`}
              value={form[key] ?? ""}
              onChange={(event) => setForm({ ...form, [key]: event.target.value || null })}
              placeholder="AA:BB:CC:DD:EE:FF"
            />
          </FormField>
        ))}
      </div>
    </FormDialog>
  )
}
