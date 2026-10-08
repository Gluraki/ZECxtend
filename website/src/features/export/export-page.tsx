import { listChallenges } from "@/api/challenges"
import { exportAttempts, exportLeaderboard } from "@/api/export"
import { PageHeader } from "@/components/shared/page-header"
import { ExportCard } from "@/features/export/export-card"
import { useApiData } from "@/hooks/use-api-data"

export function ExportPage() {
  const { data: challenges, loading } = useApiData(listChallenges, [], [])

  return (
    <div className="space-y-6">
      <PageHeader title="Data Export" />
      <div className="grid gap-6 md:grid-cols-2">
        <ExportCard
          title="Leaderboard Export"
          buttonLabel="Export Leaderboard"
          successMessage="Leaderboard exported!"
          challenges={challenges}
          loadingChallenges={loading}
          onExport={(challengeId, format, category) => exportLeaderboard(challengeId, category!, format)}
        />
        <ExportCard
          title="Attempts Export"
          buttonLabel="Export Attempts"
          successMessage="Attempts exported!"
          challenges={challenges}
          loadingChallenges={loading}
          categoryOptional
          onExport={exportAttempts}
        />
      </div>
    </div>
  )
}
