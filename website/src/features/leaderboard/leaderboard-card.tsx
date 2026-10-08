import { Trophy } from "lucide-react"
import { LoadingState } from "@/components/shared/loading-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LeaderboardEntry } from "@/features/leaderboard/leaderboard-entry"
import type { LeaderboardEntry as Entry } from "@/types/leaderboard"

interface Props {
  title: string
  entries: Entry[]
  loading: boolean
}

export function LeaderboardCard({ title, entries, loading }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingState />
        ) : (
          <div className="space-y-3">
            {entries.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">No attempts in this category.</div>
            )}
            {entries.map((entry) => (
              <LeaderboardEntry key={entry.attempt_id} entry={entry} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
