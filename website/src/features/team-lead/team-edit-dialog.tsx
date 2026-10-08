import { useState } from "react"
import { updateTeam } from "@/api/teams"
import { TeamFields } from "@/components/forms/team-fields"
import { FormDialog } from "@/components/shared/form-dialog"
import { changedFields } from "@/lib/changed-fields"
import { teamFormFrom, teamPayload } from "@/lib/team-form"
import type { Team } from "@/types/team"

interface Props {
  team: Team
  onSaved: () => void
  onClose: () => void
}

export function TeamEditDialog({ team, onSaved, onClose }: Props) {
  const [values, setValues] = useState(teamFormFrom(team))

  const submit = async () => {
    const { category: _category, ...editable } = teamPayload(values)
    await updateTeam(team.id, changedFields(team, editable))
  }

  return (
    <FormDialog
      title="Edit Team Details"
      submitLabel="Save Changes"
      successMessage="Team updated successfully"
      onSubmit={submit}
      onSaved={onSaved}
      onClose={onClose}
    >
      <TeamFields values={values} onChange={setValues} />
    </FormDialog>
  )
}
