"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { useSidebarCollapse } from "@/hooks/usesidebarcollapse"

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const sidebar = useSidebarCollapse(false)

  return (
    <SidebarProvider
      open={!sidebar.collapsed}
      onOpenChange={(open: boolean) => sidebar.setCollapsed(!open)}
    >
      {children}
    </SidebarProvider>
  )
}
