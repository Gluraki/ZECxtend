import type { Team } from "@/types/team"

export interface LeaderboardEntry {
  rank: number
  score: number
  team: Team
  attempt_id: number
  time: number
  energy_used: number | null
}
