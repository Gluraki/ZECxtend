import { Plus } from "lucide-react"
import { useState } from "react"
import { deleteTeam, listTeams } from "@/api/teams"
import { DeleteDialog } from "@/components/shared/delete-dialog"
import { PageHeader } from "@/components/shared/page-header"
import { TableCard } from "@/components/shared/table-card"
import { Button } from "@/components/ui/button"
import { TeamFormDialog } from "@/features/teams/team-form-dialog"
import { TeamRow } from "@/features/teams/team-row"
import { useApiData } from "@/hooks/use-api-data"
import type { Team } from "@/types/team"

const COLUMNS = ["Team Name", "Category", "Weight (kg)", "Power (W)", "RFID", "Actions"]

export function TeamsPage() {
  const { data: teams, loading, reload } = useApiData(listTeams, [], [])
  const [formTeam, setFormTeam] = useState<Team | "new" | null>(null)
  const [deleting, setDeleting] = useState<Team | null>(null)

  return (
    <div className="space-y-6">
      <PageHeader title="Teams & Drivers Management">
        <Button onClick={() => setFormTeam("new")} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Add Team</span>
        </Button>
      </PageHeader>
      <TableCard
        title="All Teams"
        columns={COLUMNS}
        loading={loading}
        empty={teams.length === 0}
        emptyMessage="No teams found. Add a team to get started."
      >
        {teams.map((team) => (
          <TeamRow
            key={team.id}
            team={team}
            colSpan={COLUMNS.length}
            onEdit={() => setFormTeam(team)}
            onDelete={() => setDeleting(team)}
          />
        ))}
      </TableCard>
      {formTeam && (
        <TeamFormDialog
          team={formTeam === "new" ? null : formTeam}
          onSaved={() => {
            setFormTeam(null)
            reload()
          }}
          onClose={() => setFormTeam(null)}
        />
      )}
      {deleting && (
        <DeleteDialog
          title="Delete Team"
          description="Are you sure you want to delete this team? All associated drivers will also be deleted."
          successMessage="Team deleted successfully"
          onDelete={() => deleteTeam(deleting.id)}
          onDeleted={() => {
            setDeleting(null)
            reload()
          }}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  )
}
