import { requestFile } from "@/api/client"
import type { ExportFormat } from "@/types/export"
import type { TeamCategory } from "@/types/team"

export const exportLeaderboard = (challengeId: number, category: TeamCategory, format: ExportFormat) =>
  requestFile(`/export/leaderboard/${challengeId}/category/${category}`, { format })

export const exportAttempts = (challengeId: number, format: ExportFormat, category?: TeamCategory) =>
  requestFile(`/export/attempts/${challengeId}`, { format, category })
