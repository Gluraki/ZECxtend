import { useState } from "react"
import { FormDialog } from "@/components/shared/form-dialog"
import { FormField } from "@/components/shared/form-field"
import { NumberInput } from "@/components/shared/number-input"
import { Input } from "@/components/ui/input"
import { EMPTY_DRIVER_FORM, driverPayload } from "@/lib/driver-form"
import type { Driver } from "@/types/driver"

interface Props {
  driver: Driver | null
  onSubmit: (data: Pick<Driver, "name" | "weight">) => Promise<unknown>
  onSaved: () => void
  onClose: () => void
}

export function DriverFormDialog({ driver, onSubmit, onSaved, onClose }: Props) {
  const [values, setValues] = useState(driver ? { name: driver.name, weight: driver.weight } : EMPTY_DRIVER_FORM)

  return (
    <FormDialog
      title={driver ? "Edit Driver" : "Add New Driver"}
      submitLabel={driver ? "Save Changes" : "Add Driver"}
      successMessage={driver ? "Driver updated successfully" : "Driver added successfully"}
      onSubmit={() => onSubmit(driverPayload(values))}
      onSaved={onSaved}
      onClose={onClose}
    >
      <FormField id="driver-name" label="Driver Name">
        <Input
          id="driver-name"
          value={values.name}
          onChange={(event) => setValues({ ...values, name: event.target.value })}
          placeholder="Enter driver name"
        />
      </FormField>
      <FormField id="driver-weight" label="Weight (kg)">
        <NumberInput
          id="driver-weight"
          step="0.1"
          value={values.weight}
          onChange={(weight) => setValues({ ...values, weight })}
          placeholder="Enter driver weight"
        />
      </FormField>
    </FormDialog>
  )
}
