import { useEffect, useMemo, useState, type ReactNode } from "react"
import * as authApi from "@/api/auth"
import { refreshAccessToken, setAccessToken, subscribeToken } from "@/api/client"
import { AuthContext, type AuthState } from "@/auth/auth-context"
import { decodeSession } from "@/auth/token"
import type { Session } from "@/types/auth"

const EXPIRED_MESSAGE = "Your session has expired. Please log in again."

interface Props {
  onSessionExpired: () => void
  children: ReactNode
}

export function AuthProvider({ onSessionExpired, children }: Props) {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)
  const [sessionMessage, setSessionMessage] = useState<string | null>(null)

  useEffect(
    () =>
      subscribeToken((token, expired) => {
        setSession(token ? decodeSession(token) : null)
        if (expired) {
          setSessionMessage(EXPIRED_MESSAGE)
          onSessionExpired()
        }
      }),
    [onSessionExpired],
  )

  useEffect(() => {
    refreshAccessToken().then((token) => {
      setAccessToken(token)
      setReady(true)
    })
  }, [])

  const value = useMemo<AuthState>(
    () => ({
      session,
      ready,
      sessionMessage,
      login: async (username, password) => {
        const { access_token } = await authApi.login(username, password)
        setSessionMessage(null)
        setAccessToken(access_token)
      },
      logout: async () => {
        await authApi.logout().catch(() => undefined)
        setAccessToken(null)
      },
      changePassword: async (currentPassword, newPassword) => {
        const { access_token } = await authApi.changePassword(currentPassword, newPassword)
        setAccessToken(access_token)
      },
    }),
    [session, ready, sessionMessage],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
