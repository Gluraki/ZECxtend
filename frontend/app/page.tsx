"use client"

import { useState, useEffect, type ReactNode } from "react"
import Image from "next/image"
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

import { User, Users, UserCog, Download, Trophy, Swords } from "lucide-react"

import DriversTab from "@/components/tabs/DriversTab"
import TeamsTab from "@/components/tabs/TeamsTab"
import UsersTab from "@/components/tabs/UsersTab"
import ChallengeTab from "@/components/tabs/ChallengeTab"
import ExportTab from "@/components/tabs/ExportTab"
import LeaderboardTab from "@/components/tabs/LeaderboardTab"

type AdminTab = "drivers" | "teams" | "challenges" | "users" | "config" | "export" | "leaderboard"

export function AppSidebar({ children }: { children?: ReactNode }) {
  const [open, setOpen] = useState(false)

  return <SidebarProvider open={open} onOpenChange={setOpen}>{children}</SidebarProvider>
}


export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("drivers")
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false)
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isAddChallengeOpen, setIsAddChallengeOpen] = useState(false)
  const [editingDriver, setEditingDriver] = useState<any | null>(null)
  const [editingTeam, setEditingTeam] = useState<any | null>(null)
  const [editingUser, setEditingUser] = useState<any | null>(null)
  const [editingChallenge, setEditingChallenge] = useState<any | null>(null)
  const [drivers, setDrivers] = useState<any[]>([])
  const [visibleTeams, setVisibleTeams] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [challenges, setChallenges] = useState<any[]>([])
  const [exportFormat, setExportFormat] = useState("csv")
  const [exportDateRange, setExportDateRange] = useState({
    from: new Date().toISOString(),
    to: new Date().toISOString(),
  })
  const raceCategories = ["test1", "test2"]
  const [selectedCategory, setSelectedCategory] = useState(raceCategories[0])
  const mockLeaderboardData = {
    test1: [
      { position: 1, driver: "Pro One", team: "Gamma", bestTime: "1:11.999", points: 100 },
    ],
    test2: [
      { position: 1, driver: "Am One", team: "Delta", bestTime: "1:15.123", points: 80 },
    ],
  }

  const handleDeleteTeam = (id: string | number) => {}
  const handleExport = () => {}
  const toggleUserStatus = (id: string | number) => {}
  const handleEditUser = (user: any) => {
    setIsAddUserOpen(true)
    setEditingUser(user)
  }
  const deleteChallenge = (id: string | number) => {
    setChallenges(challenges.filter((c) => c.id !== id))
  }
  const handleEditChallenge = (challenge: any) => {
    setIsAddChallengeOpen(true)
    setEditingChallenge(challenge)
  }
  const getTeamName = (id: string | number | undefined): string => {
    const team = visibleTeams.find((team) => team.id === id)
    return team ? team.name : "N/A"
  }

  return (
    <AppSidebar>
      <Sidebar collapsible="icon" className="border-r">
        <SidebarHeader className="px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold group-data-[collapsible=icon]:hidden">ZEC-Timing</span>
          </div>
        </SidebarHeader>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Leaderboard"
              isActive={activeTab === "leaderboard"}
              onClick={() => setActiveTab("leaderboard")}
            >
              <Trophy />
              <span>Leaderboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Teams"
              isActive={activeTab === "teams"}
              onClick={() => setActiveTab("teams")}
            >
              <Users />
              <span>Teams</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Drivers"
              isActive={activeTab === "drivers"}
              onClick={() => setActiveTab("drivers")}
            >
              <User />
              <span>Drivers</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Challenges"
              isActive={activeTab === "challenges"}
              onClick={() => setActiveTab("challenges")}
            >
              <Swords />
              <span>Challenges</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Users"
              isActive={activeTab === "users"}
              onClick={() => setActiveTab("users")}
            >
              <UserCog />
              <span>Users</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Export"
              isActive={activeTab === "export"}
              onClick={() => setActiveTab("export")}
            >
              <Download />
              <span>Export</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </Sidebar>
      <main className="flex-1 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
          </div>

          <div className="flex items-center gap-4">
            <div className="relative h-12 w-[100px]">
              <Image
                src="/Logo_HTL_100.png"
                alt="Logo HTL"
                fill
                className="object-contain"
                priority
              />
            </div>

            <div className="relative h-14 w-[140px]">
              <Image
                src="/ZEC-Logo.png"
                alt="ZEC Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>

          {activeTab === "leaderboard" && (
            <LeaderboardTab
              raceCategories={raceCategories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              mockLeaderboardData={mockLeaderboardData}
            />
          )}
          {activeTab === "drivers" && (
            <DriversTab
              drivers={drivers}
              setDrivers={setDrivers}
              setIsAddDriverOpen={setIsAddDriverOpen}
              setEditingDriver={setEditingDriver}
            />
          )}
          {activeTab === "teams" && (
            <TeamsTab
              visibleTeams={visibleTeams}
              setIsAddTeamOpen={setIsAddTeamOpen}
              setEditingTeam={setEditingTeam}
              handleDeleteTeam={handleDeleteTeam}
            />
          )}
          {activeTab === "challenges" && (
            <ChallengeTab
              challenges={challenges}
              setIsAddChallengeOpen={setIsAddChallengeOpen}
              setEditingChallenge={handleEditChallenge}
              deleteChallenge={deleteChallenge}
            />
          )}
          {activeTab === "users" && (
            <UsersTab
              users={users}
              setIsAddUserOpen={setIsAddUserOpen}
              handleEditUser={handleEditUser}
              toggleUserStatus={toggleUserStatus}
              getTeamName={getTeamName}
            />
          )}
          {activeTab === "export" && (
            <ExportTab
              exportFormat={exportFormat}
              setExportFormat={setExportFormat}
              exportDateRange={exportDateRange}
              setExportDateRange={setExportDateRange}
              handleExport={handleExport}
            />
          )}

        </main>
    </AppSidebar>
  )
}
