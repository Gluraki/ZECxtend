import { useCallback, useState } from "react"
import { AppShell } from "@/app-shell"
import { AuthProvider } from "@/auth/auth-provider"
import { DEFAULT_TAB, type Tab } from "@/auth/permissions"
import { Toaster } from "@/components/ui/sonner"

export function App() {
  const [tab, setTab] = useState<Tab>(DEFAULT_TAB)
  const showAccount = useCallback(() => setTab("account"), [])

  return (
    <AuthProvider onSessionExpired={showAccount}>
      <AppShell tab={tab} onTabChange={setTab} />
      <Toaster />
    </AuthProvider>
  )
}
