import type { Role } from "@/types/auth"
import type { ScoringType } from "@/types/challenge"
import type { TeamCategory } from "@/types/team"

export const CATEGORY_LABELS: Record<TeamCategory, string> = {
  close_to_series: "Close to Series",
  advanced_class: "Advanced Class",
  professional_class: "Professional Class",
}

export const CATEGORIES = Object.keys(CATEGORY_LABELS) as TeamCategory[]

export const SCORING_TYPE_LABELS: Record<ScoringType, string> = {
  time: "Time",
  acceleration: "Acceleration",
  endurance: "Endurance",
}

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  TEAMLEAD: "Team Lead",
  USER: "User",
}
