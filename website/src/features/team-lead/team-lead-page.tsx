import { useAuth } from "@/auth/use-auth"
import { NoTeamCard } from "@/features/team-lead/no-team-card"
import { TeamLeadView } from "@/features/team-lead/team-lead-view"

export function TeamLeadPage() {
  const { session } = useAuth()
  if (!session?.teamId) return <NoTeamCard />
  return <TeamLeadView teamId={session.teamId} />
}
