import { getLeaderboard } from "@/api/leaderboard"
import { ChallengeSelect } from "@/components/shared/challenge-select"
import { PageHeader } from "@/components/shared/page-header"
import { LeaderboardCard } from "@/features/leaderboard/leaderboard-card"
import { useApiData } from "@/hooks/use-api-data"
import { useChallengeSelection } from "@/hooks/use-challenge-selection"
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/labels"
import type { LeaderboardEntry } from "@/types/leaderboard"

const EMPTY_BOARDS: LeaderboardEntry[][] = CATEGORIES.map(() => [])

export function LeaderboardPage() {
  const { challenges, loading, challengeId, setChallengeId } = useChallengeSelection()

  const boards = useApiData(
    () =>
      challengeId === null
        ? Promise.resolve(EMPTY_BOARDS)
        : Promise.all(CATEGORIES.map((category) => getLeaderboard(challengeId, category))),
    EMPTY_BOARDS,
    [challengeId],
  )

  return (
    <div className="space-y-6">
      <PageHeader title="Leaderboard">
        <ChallengeSelect challenges={challenges} value={challengeId} onChange={setChallengeId} disabled={loading} />
      </PageHeader>
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {CATEGORIES.map((category, index) => (
          <LeaderboardCard
            key={category}
            title={CATEGORY_LABELS[category]}
            entries={boards.data[index]}
            loading={boards.loading}
          />
        ))}
      </div>
    </div>
  )
}
