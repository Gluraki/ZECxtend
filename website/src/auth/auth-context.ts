import { createContext } from "react"
import type { Session } from "@/types/auth"

export interface AuthState {
  session: Session | null
  ready: boolean
  sessionMessage: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
}

export const AuthContext = createContext<AuthState | null>(null)
