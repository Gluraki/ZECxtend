export interface Driver {
  id: number
  name: string
  team_id: number
  weight: number
  created_at: string
}

export type DriverCreate = Omit<Driver, "id" | "created_at">

export type DriverUpdate = Partial<DriverCreate>
