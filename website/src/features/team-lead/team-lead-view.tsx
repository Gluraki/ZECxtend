import { useState } from "react"
import { deleteDriver, listDrivers, saveDriver } from "@/api/drivers"
import { getTeam } from "@/api/teams"
import { DriverFormDialog } from "@/components/forms/driver-form-dialog"
import { DeleteDialog } from "@/components/shared/delete-dialog"
import { LoadingState } from "@/components/shared/loading-state"
import { DriversCard } from "@/features/team-lead/drivers-card"
import { NoTeamCard } from "@/features/team-lead/no-team-card"
import { TeamDetailsCard } from "@/features/team-lead/team-details-card"
import { TeamEditDialog } from "@/features/team-lead/team-edit-dialog"
import { useApiData } from "@/hooks/use-api-data"
import type { Driver } from "@/types/driver"
import type { Team } from "@/types/team"

interface Props {
  teamId: number
}

export function TeamLeadView({ teamId }: Props) {
  const team = useApiData<Team | null>(() => getTeam(teamId), null, [teamId])
  const drivers = useApiData(() => listDrivers(teamId), [], [teamId])
  const [editingTeam, setEditingTeam] = useState(false)
  const [driverForm, setDriverForm] = useState<Driver | "new" | null>(null)
  const [deleting, setDeleting] = useState<Driver | null>(null)
  const editingDriver = driverForm === "new" ? null : driverForm

  if (team.loading && !team.data) return <LoadingState className="h-96" />
  if (!team.data) return <NoTeamCard />

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">{team.data.name}</h2>
      <TeamDetailsCard team={team.data} onEdit={() => setEditingTeam(true)} />
      <DriversCard
        drivers={drivers.data}
        onAdd={() => setDriverForm("new")}
        onEdit={setDriverForm}
        onDelete={setDeleting}
      />
      {editingTeam && (
        <TeamEditDialog
          team={team.data}
          onSaved={() => {
            setEditingTeam(false)
            team.reload()
          }}
          onClose={() => setEditingTeam(false)}
        />
      )}
      {driverForm && (
        <DriverFormDialog
          driver={editingDriver}
          onSubmit={(data) => saveDriver(teamId, editingDriver, data)}
          onSaved={() => {
            setDriverForm(null)
            drivers.reload()
          }}
          onClose={() => setDriverForm(null)}
        />
      )}
      {deleting && (
        <DeleteDialog
          title="Delete Driver"
          description={`Are you sure you want to remove ${deleting.name} from the team?`}
          successMessage="Driver removed successfully"
          onDelete={() => deleteDriver(deleting.id)}
          onDeleted={() => {
            setDeleting(null)
            drivers.reload()
          }}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  )
}
