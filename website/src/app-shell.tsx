import { DEFAULT_TAB, tabsFor, type Tab } from "@/auth/permissions"
import { useAuth } from "@/auth/use-auth"
import { AppLayout } from "@/components/layout/app-layout"
import { LoadingState } from "@/components/shared/loading-state"
import { AccountPage } from "@/features/account/account-page"
import { AttemptsPage } from "@/features/attempts/attempts-page"
import { ChallengesPage } from "@/features/challenges/challenges-page"
import { ExportPage } from "@/features/export/export-page"
import { LeaderboardPage } from "@/features/leaderboard/leaderboard-page"
import { TeamLeadPage } from "@/features/team-lead/team-lead-page"
import { TeamsPage } from "@/features/teams/teams-page"
import { UsersPage } from "@/features/users/users-page"

interface Props {
  tab: Tab
  onTabChange: (tab: Tab) => void
}

export function AppShell({ tab, onTabChange }: Props) {
  const { session, ready } = useAuth()
  const tabs = tabsFor(session?.role)
  const activeTab = tabs.includes(tab) ? tab : DEFAULT_TAB

  const renderPage = () => {
    switch (activeTab) {
      case "leaderboard":
        return <LeaderboardPage />
      case "attempts":
        return <AttemptsPage />
      case "teams":
        return session?.role === "TEAMLEAD" ? <TeamLeadPage /> : <TeamsPage />
      case "challenges":
        return <ChallengesPage />
      case "users":
        return <UsersPage />
      case "export":
        return <ExportPage />
      case "account":
        return <AccountPage onLogin={() => onTabChange(DEFAULT_TAB)} />
    }
  }

  return (
    <AppLayout tabs={tabs} activeTab={activeTab} onSelect={onTabChange}>
      {ready ? renderPage() : <LoadingState className="py-24" />}
    </AppLayout>
  )
}
