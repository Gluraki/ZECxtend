import { request } from "@/api/client"
import type { LeaderboardEntry } from "@/types/leaderboard"
import type { TeamCategory } from "@/types/team"

export const getLeaderboard = (challengeId: number, category: TeamCategory) =>
  request<LeaderboardEntry[]>(`/leaderboard/${challengeId}/category/${category}`)
