import type { Role } from "@/types/auth"

export type Tab = "leaderboard" | "attempts" | "teams" | "challenges" | "users" | "export" | "account"

export const DEFAULT_TAB: Tab = "leaderboard"

const GUEST_TABS: Tab[] = ["leaderboard", "account"]

const TABS_BY_ROLE: Record<Role, Tab[]> = {
  ADMIN: ["leaderboard", "attempts", "teams", "challenges", "users", "export", "account"],
  TEAMLEAD: ["leaderboard", "teams", "account"],
  USER: GUEST_TABS,
}

export function tabsFor(role: Role | undefined) {
  return role ? TABS_BY_ROLE[role] : GUEST_TABS
}
