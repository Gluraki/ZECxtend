import { Plus, X } from "lucide-react"
import { FormField } from "@/components/shared/form-field"
import { IconButton } from "@/components/shared/icon-button"
import { NumberInput } from "@/components/shared/number-input"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface NewDriver {
  name: string
  weight: number | null
}

interface Props {
  drivers: NewDriver[]
  onChange: (drivers: NewDriver[]) => void
}

export function NewDriverFields({ drivers, onChange }: Props) {
  const update = (index: number, driver: NewDriver) =>
    onChange(drivers.map((current, i) => (i === index ? driver : current)))

  return (
    <div className="border-t pt-4">
      <div className="mb-3 flex items-center justify-between">
        <Label>Drivers (Optional)</Label>
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...drivers, { name: "", weight: null }])}>
          <Plus className="mr-1 h-4 w-4" />
          Add Driver
        </Button>
      </div>
      <div className="space-y-3">
        {drivers.map((driver, index) => (
          <div key={index} className="flex items-end gap-2">
            <FormField id={`driver-name-${index}`} label="Driver Name" className="flex-1">
              <Input
                id={`driver-name-${index}`}
                value={driver.name}
                onChange={(event) => update(index, { ...driver, name: event.target.value })}
                placeholder="Driver name"
              />
            </FormField>
            <FormField id={`driver-weight-${index}`} label="Weight (kg)" className="w-32">
              <NumberInput
                id={`driver-weight-${index}`}
                step="0.1"
                value={driver.weight}
                onChange={(weight) => update(index, { ...driver, weight })}
                placeholder="Weight"
              />
            </FormField>
            <IconButton
              icon={X}
              label="Remove driver"
              size="icon"
              onClick={() => onChange(drivers.filter((_, i) => i !== index))}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
