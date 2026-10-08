import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Option<T extends string> {
  value: T
  label: string
}

interface Props<T extends string> {
  id?: string
  value: T | undefined
  options: Option<T>[]
  onChange: (value: T) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function OptionSelect<T extends string>({
  id,
  value,
  options,
  onChange,
  placeholder,
  disabled,
  className,
}: Props<T>) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as T)} disabled={disabled}>
      <SelectTrigger id={id} className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
