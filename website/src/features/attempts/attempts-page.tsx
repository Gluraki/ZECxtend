import { useState } from "react"
import { deleteAttempt, listAttempts } from "@/api/attempts"
import { listDrivers } from "@/api/drivers"
import { listTeams } from "@/api/teams"
import { ChallengeSelect } from "@/components/shared/challenge-select"
import { DeleteDialog } from "@/components/shared/delete-dialog"
import { PageHeader } from "@/components/shared/page-header"
import { TableCard } from "@/components/shared/table-card"
import { AttemptEditDialog } from "@/features/attempts/attempt-edit-dialog"
import { AttemptRow } from "@/features/attempts/attempt-row"
import { useApiData } from "@/hooks/use-api-data"
import { useChallengeSelection } from "@/hooks/use-challenge-selection"
import type { Attempt } from "@/types/attempt"

const COLUMNS = ["Team", "Driver", "Duration", "Energy Used", "Start Time", "End Time", "Valid", "Actions"]

export function AttemptsPage() {
  const { challenges, loading, challengeId, setChallengeId } = useChallengeSelection()
  const teams = useApiData(listTeams, [], [])
  const drivers = useApiData(() => listDrivers(), [], [])
  const attempts = useApiData<Attempt[]>(
    () => (challengeId === null ? Promise.resolve([]) : listAttempts(challengeId)),
    [],
    [challengeId],
  )
  const [editing, setEditing] = useState<Attempt | null>(null)
  const [deleting, setDeleting] = useState<Attempt | null>(null)

  const teamName = (id: number) => teams.data.find((team) => team.id === id)?.name ?? `Team #${id}`
  const driverName = (id: number) => drivers.data.find((driver) => driver.id === id)?.name ?? `Driver #${id}`

  return (
    <div className="space-y-6">
      <PageHeader title="Attempts Management">
        <ChallengeSelect challenges={challenges} value={challengeId} onChange={setChallengeId} disabled={loading} />
      </PageHeader>
      <TableCard
        title="All Attempts"
        columns={COLUMNS}
        loading={attempts.loading}
        empty={attempts.data.length === 0}
        emptyMessage="No attempts found for this challenge."
      >
        {attempts.data.map((attempt) => (
          <AttemptRow
            key={attempt.id}
            attempt={attempt}
            teamName={teamName(attempt.team_id)}
            driverName={driverName(attempt.driver_id)}
            onEdit={() => setEditing(attempt)}
            onDelete={() => setDeleting(attempt)}
          />
        ))}
      </TableCard>
      {editing && (
        <AttemptEditDialog
          attempt={editing}
          teamName={teamName(editing.team_id)}
          driverName={driverName(editing.driver_id)}
          onSaved={() => {
            setEditing(null)
            attempts.reload()
          }}
          onClose={() => setEditing(null)}
        />
      )}
      {deleting && (
        <DeleteDialog
          title="Delete Attempt"
          description="Are you sure you want to delete this attempt?"
          successMessage="Attempt deleted successfully"
          onDelete={() => deleteAttempt(deleting.id)}
          onDeleted={() => {
            setDeleting(null)
            attempts.reload()
          }}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  )
}
