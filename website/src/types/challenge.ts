export type ScoringType = "time" | "acceleration" | "endurance"

export interface Challenge {
  id: number
  name: string
  max_attempts: number | null
  scoring_type: ScoringType | null
  esp_mac_start1: string | null
  esp_mac_start2: string | null
  esp_mac_finish1: string | null
  esp_mac_finish2: string | null
  created_at: string | null
}

export type ChallengeUpdate = Partial<Omit<Challenge, "id" | "created_at">>
