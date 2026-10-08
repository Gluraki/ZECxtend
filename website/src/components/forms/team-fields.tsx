import { FormField } from "@/components/shared/form-field"
import { NumberInput } from "@/components/shared/number-input"
import { OptionSelect } from "@/components/shared/option-select"
import { Input } from "@/components/ui/input"
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/labels"
import type { TeamFormValues } from "@/lib/team-form"

const CATEGORY_OPTIONS = CATEGORIES.map((category) => ({ value: category, label: CATEGORY_LABELS[category] }))

interface Props {
  values: TeamFormValues
  onChange: (values: TeamFormValues) => void
  withCategory?: boolean
}

export function TeamFields({ values, onChange, withCategory = false }: Props) {
  const mark = withCategory ? " *" : ""

  return (
    <>
      <FormField id="team-name" label={`Team Name${mark}`}>
        <Input
          id="team-name"
          value={values.name}
          onChange={(event) => onChange({ ...values, name: event.target.value })}
          placeholder="Enter team name"
        />
      </FormField>
      {withCategory && (
        <FormField id="team-category" label="Category *">
          <OptionSelect
            id="team-category"
            value={values.category}
            options={CATEGORY_OPTIONS}
            onChange={(category) => onChange({ ...values, category })}
            className="w-full"
          />
        </FormField>
      )}
      <div className="grid grid-cols-2 gap-4">
        <FormField id="team-weight" label={`Vehicle Weight (kg)${mark}`}>
          <NumberInput
            id="team-weight"
            step="0.1"
            value={values.vehicle_weight}
            onChange={(vehicle_weight) => onChange({ ...values, vehicle_weight })}
          />
        </FormField>
        <FormField id="team-power" label={`Mean Power (W)${mark}`}>
          <NumberInput
            id="team-power"
            step="0.1"
            value={values.mean_power}
            onChange={(mean_power) => onChange({ ...values, mean_power })}
          />
        </FormField>
      </div>
      <FormField id="team-rfid" label={`RFID Identifier${mark}`}>
        <Input
          id="team-rfid"
          value={values.rfid_identifier}
          onChange={(event) => onChange({ ...values, rfid_identifier: event.target.value })}
          placeholder="Enter RFID identifier"
        />
      </FormField>
    </>
  )
}
