import type { Role, Session } from "@/types/auth"

interface Claims {
  sub: string
  id: number
  role: Role
  team_id?: number
  pwd_change?: boolean
}

function decodePayload(token: string): Claims {
  const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")
  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0))
  return JSON.parse(new TextDecoder().decode(bytes))
}

export function decodeSession(token: string): Session | null {
  try {
    const claims = decodePayload(token)
    return {
      id: claims.id,
      username: claims.sub,
      role: claims.role,
      teamId: claims.team_id ?? null,
      mustChangePassword: claims.pwd_change === true,
    }
  } catch {
    return null
  }
}
