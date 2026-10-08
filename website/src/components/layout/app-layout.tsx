import { useState, type ReactNode } from "react"
import type { Tab } from "@/auth/permissions"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { Footer } from "@/components/layout/footer"
import { PasswordWarning } from "@/components/layout/password-warning"
import { TopBar } from "@/components/layout/top-bar"
import { SidebarProvider } from "@/components/ui/sidebar"

interface Props {
  tabs: Tab[]
  activeTab: Tab
  onSelect: (tab: Tab) => void
  children: ReactNode
}

export function AppLayout({ tabs, activeTab, onSelect, children }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <div className="flex min-h-screen w-full flex-col">
        <div className="flex w-full flex-1">
          <AppSidebar tabs={tabs} activeTab={activeTab} onSelect={onSelect} />
          <div className="flex min-w-0 flex-1 flex-col">
            <main className="flex-1 p-6">
              <TopBar />
              {activeTab !== "account" && <PasswordWarning onChangePassword={() => onSelect("account")} />}
              {children}
            </main>
          </div>
        </div>
        <Footer />
      </div>
    </SidebarProvider>
  )
}
