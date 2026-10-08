import { useState } from "react"
import { createDriver } from "@/api/drivers"
import { createTeam, updateTeam } from "@/api/teams"
import { TeamFields } from "@/components/forms/team-fields"
import { FormDialog } from "@/components/shared/form-dialog"
import { NewDriverFields, type NewDriver } from "@/features/teams/new-driver-fields"
import { EMPTY_TEAM_FORM, teamFormFrom, teamPayload } from "@/lib/team-form"
import type { Team, TeamCreate } from "@/types/team"

async function createWithDrivers(payload: TeamCreate, drivers: NewDriver[]) {
  if (drivers.some((driver) => !driver.name.trim() || !driver.weight)) {
    throw new Error("Every driver needs a name and a weight")
  }
  const team = await createTeam(payload)
  await Promise.all(
    drivers.map((driver) => createDriver({ name: driver.name.trim(), weight: driver.weight!, team_id: team.id })),
  )
}

interface Props {
  team: Team | null
  onSaved: () => void
  onClose: () => void
}

export function TeamFormDialog({ team, onSaved, onClose }: Props) {
  const [values, setValues] = useState(team ? teamFormFrom(team) : EMPTY_TEAM_FORM)
  const [drivers, setDrivers] = useState<NewDriver[]>([])

  const submit = async () => {
    const payload = teamPayload(values)
    if (team) await updateTeam(team.id, payload)
    else await createWithDrivers(payload, drivers)
  }

  return (
    <FormDialog
      title={team ? "Edit Team" : "Add New Team"}
      submitLabel={team ? "Update Team" : "Create Team"}
      successMessage={team ? "Team updated successfully" : "Team created successfully"}
      className="max-h-[90vh] overflow-y-auto"
      onSubmit={submit}
      onSaved={onSaved}
      onClose={onClose}
    >
      <TeamFields values={values} onChange={setValues} withCategory />
      {!team && <NewDriverFields drivers={drivers} onChange={setDrivers} />}
    </FormDialog>
  )
}
