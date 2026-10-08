import { OptionSelect } from "@/components/shared/option-select"
import type { Challenge } from "@/types/challenge"

interface Props {
  challenges: Challenge[]
  value: number | null
  onChange: (id: number) => void
  disabled?: boolean
  className?: string
}

export function ChallengeSelect({ challenges, value, onChange, disabled, className = "w-64" }: Props) {
  return (
    <OptionSelect
      value={value?.toString()}
      options={challenges.map((challenge) => ({ value: challenge.id.toString(), label: challenge.name }))}
      onChange={(id) => onChange(Number(id))}
      placeholder={disabled ? "Loading..." : "Select challenge"}
      disabled={disabled}
      className={className}
    />
  )
}
