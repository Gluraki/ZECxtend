import { FormField } from "@/components/shared/form-field"
import { OptionSelect } from "@/components/shared/option-select"
import { Input } from "@/components/ui/input"
import { ROLE_LABELS } from "@/lib/labels"
import type { Role } from "@/types/auth"
import type { Team } from "@/types/team"

const NO_TEAM = "none"

const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({ value: value as Role, label }))

export interface UserFormValues {
  username: string
  password: string
  team_id: number | null
  role: Role
}

interface Props {
  values: UserFormValues
  onChange: (values: UserFormValues) => void
  teams: Team[]
  passwordLabel: string
  teamLabel: string
}

export function UserFields({ values, onChange, teams, passwordLabel, teamLabel }: Props) {
  const teamOptions = [
    { value: NO_TEAM, label: "No Team" },
    ...teams.map((team) => ({ value: team.id.toString(), label: team.name })),
  ]

  return (
    <>
      <FormField id="username" label="Username">
        <Input
          id="username"
          value={values.username}
          onChange={(event) => onChange({ ...values, username: event.target.value })}
        />
      </FormField>
      <FormField id="password" label={passwordLabel}>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={(event) => onChange({ ...values, password: event.target.value })}
        />
      </FormField>
      <FormField id="team" label={teamLabel}>
        <OptionSelect
          id="team"
          value={values.team_id?.toString() ?? NO_TEAM}
          options={teamOptions}
          onChange={(team) => onChange({ ...values, team_id: team === NO_TEAM ? null : Number(team) })}
          className="w-full"
        />
      </FormField>
      <FormField id="role" label="Role">
        <OptionSelect
          id="role"
          value={values.role}
          options={ROLE_OPTIONS}
          onChange={(role) => onChange({ ...values, role })}
          className="w-full"
        />
      </FormField>
    </>
  )
}
