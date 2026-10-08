import { CircleUser, Download, FolderClosed, Swords, Trophy, UserCog, Users, type LucideIcon } from "lucide-react"
import type { Tab } from "@/auth/permissions"

interface NavItem {
  id: Tab
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  { id: "attempts", label: "Attempts", icon: FolderClosed },
  { id: "teams", label: "Teams", icon: Users },
  { id: "challenges", label: "Challenges", icon: Swords },
  { id: "users", label: "Users", icon: UserCog },
  { id: "export", label: "Export", icon: Download },
  { id: "account", label: "Account", icon: CircleUser },
]
