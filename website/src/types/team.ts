export type TeamCategory = "close_to_series" | "advanced_class" | "professional_class"

export interface Team {
  id: number
  name: string
  category: TeamCategory
  mean_power: number
  vehicle_weight: number
  rfid_identifier: string
  created_at: string
}

export type TeamCreate = Omit<Team, "id" | "created_at">

export type TeamUpdate = Partial<TeamCreate>
