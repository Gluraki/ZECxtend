import { PositionBadge } from "@/features/leaderboard/position-badge"
import { formatDuration, formatNumber } from "@/lib/format"
import type { LeaderboardEntry as Entry } from "@/types/leaderboard"

interface Props {
  entry: Entry
}

export function LeaderboardEntry({ entry }: Props) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 transition-colors hover:bg-slate-100">
      <div className="flex items-center gap-4">
        <PositionBadge rank={entry.rank} />
        <div className="font-medium">{entry.team.name}</div>
      </div>
      <div className="text-right">
        <div className="font-mono font-medium">{formatNumber(entry.score)}</div>
        <div className="font-mono text-xs text-muted-foreground">
          {formatDuration(entry.time)}
          {entry.energy_used !== null && ` · ${formatNumber(entry.energy_used, 2)} Wh`}
        </div>
      </div>
    </div>
  )
}
