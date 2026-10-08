import { SidebarTrigger } from "@/components/ui/sidebar"

export function TopBar() {
  return (
    <div className="mb-4 flex items-center justify-between">
      <SidebarTrigger className="md:invisible" />
      <div className="flex items-center gap-4">
        <img src="/Logo_HTL_100.png" alt="Logo HTL" className="h-12 w-25 object-contain" />
        <img src="/ZEC-Logo.png" alt="ZEC Logo" className="h-14 w-35 object-contain" />
      </div>
    </div>
  )
}
