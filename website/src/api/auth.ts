import { request } from "@/api/client"
import type { TokenResponse } from "@/types/auth"

export const login = (username: string, password: string) =>
  request<TokenResponse>("/login", { method: "POST", form: { username, password } })

export const logout = () => request<void>("/logout", { method: "POST" })

export const changePassword = (currentPassword: string, newPassword: string) =>
  request<TokenResponse>("/password", {
    method: "POST",
    body: { current_password: currentPassword, new_password: newPassword },
  })
