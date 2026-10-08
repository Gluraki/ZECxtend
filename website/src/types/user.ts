import type { Role } from "@/types/auth"

export interface User {
  id: number
  username: string
  team_id: number | null
  role: Role
  must_change_password: boolean
  created_at: string | null
  updated_at: string | null
}

export interface UserCreate {
  username: string
  password: string
  team_id: number | null
  role: Role
  must_change_password: boolean
}

export type UserUpdate = Partial<Omit<UserCreate, "must_change_password">>
