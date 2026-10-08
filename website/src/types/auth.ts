export type Role = "ADMIN" | "TEAMLEAD" | "USER"

export interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export interface Session {
  id: number
  username: string
  role: Role
  teamId: number | null
  mustChangePassword: boolean
}
