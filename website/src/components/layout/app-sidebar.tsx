import type { Tab } from "@/auth/permissions"
import { NAV_ITEMS } from "@/components/layout/nav-items"
import {
  Sidebar,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

interface Props {
  tabs: Tab[]
  activeTab: Tab
  onSelect: (tab: Tab) => void
}

export function AppSidebar({ tabs, activeTab, onSelect }: Props) {
  const items = NAV_ITEMS.filter((item) => tabs.includes(item.id))
  const { isMobile, setOpenMobile } = useSidebar()

  const select = (tab: Tab) => {
    onSelect(tab)
    if (isMobile) setOpenMobile(false)
  }

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarTrigger className="absolute top-3 -right-3.5 z-20 hidden border bg-background opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100 md:inline-flex" />
      <SidebarMenu className="py-2 group-data-[collapsible=icon]:items-center">
        {items.map(({ id, label, icon: Icon }) => (
          <SidebarMenuItem key={id}>
            <SidebarMenuButton tooltip={label} isActive={activeTab === id} onClick={() => select(id)}>
              <Icon />
              <span>{label}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </Sidebar>
  )
}
