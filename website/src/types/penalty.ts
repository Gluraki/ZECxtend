export interface PenaltyType {
  id: number
  type: string
  amount: number
}

export interface Penalty {
  id: number
  attempt_id: number
  count: number
  penalty_type_id: number
  created_at: string | null
}

export type PenaltyCreate = Omit<Penalty, "id" | "created_at">
