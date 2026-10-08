import { useState } from "react"
import { listChallenges } from "@/api/challenges"
import { PageHeader } from "@/components/shared/page-header"
import { TableCard } from "@/components/shared/table-card"
import { ChallengeEditDialog } from "@/features/challenges/challenge-edit-dialog"
import { ChallengeRow } from "@/features/challenges/challenge-row"
import { useApiData } from "@/hooks/use-api-data"
import type { Challenge } from "@/types/challenge"

const COLUMNS = ["Name", "Scoring Type", "Max Attempts", "Start MACs", "Finish MACs", "Actions"]

export function ChallengesPage() {
  const { data: challenges, loading, reload } = useApiData(listChallenges, [], [])
  const [editing, setEditing] = useState<Challenge | null>(null)

  return (
    <div className="space-y-6">
      <PageHeader title="Challenge Management" />
      <TableCard
        title="All Challenges"
        columns={COLUMNS}
        loading={loading}
        empty={challenges.length === 0}
        emptyMessage="No challenges found."
      >
        {challenges.map((challenge) => (
          <ChallengeRow key={challenge.id} challenge={challenge} onEdit={() => setEditing(challenge)} />
        ))}
      </TableCard>
      {editing && (
        <ChallengeEditDialog
          challenge={editing}
          onSaved={() => {
            setEditing(null)
            reload()
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
