import { use } from "react"
import { AuthContext } from "@/auth/auth-context"

export function useAuth() {
  const auth = use(AuthContext)
  if (!auth) throw new Error("useAuth must be used inside AuthProvider")
  return auth
}
