export interface Attempt {
  id: number
  team_id: number
  driver_id: number
  challenge_id: number
  start_time: string
  end_time: string
  energy_used: number
  is_valid: boolean
  created_at: string
}

export type AttemptUpdate = Partial<Pick<Attempt, "start_time" | "end_time" | "energy_used">>
