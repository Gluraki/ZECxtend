"use client"
import { useState, useEffect } from "react"
import DriversTab from "@/components/tabs/DriversTab"
import TeamsTab from "@/components/tabs/TeamsTab"
import UsersTab from "@/components/tabs/UsersTab"
import ChallengeTab from "@/components/tabs/ChallengeTab"
import ExportTab from "@/components/tabs/ExportTab"
import LeaderboardTab from "@/components/tabs/LeaderboardTab"
import LoginTab from "@/components/tabs/LoginTab"
import {SideBarLayout, type Tabs} from "@/components/layout/sidebarlayout"
import { AuthService } from "@/lib/auth"
import { getPermissions, getDefaultTab, canAccessTab } from "@/lib/permissions"

interface User {
  id: string
  username: string
  role: string
}

export default function Webapp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<Tabs>("leaderboard")
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false)
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false)
  const [editingDriver, setEditingDriver] = useState<any | null>(null)
  const [editingTeam, setEditingTeam] = useState<any | null>(null)
  const [drivers, setDrivers] = useState<any[]>([])
  const [visibleTeams, setVisibleTeams] = useState<any[]>([])
  const [exportFormat, setExportFormat] = useState("csv")
  const [exportDateRange, setExportDateRange] = useState({
    from: new Date().toISOString(),
    to: new Date().toISOString(),
  })
  const permissions = getPermissions(currentUser?.role || null)

  useEffect(() => {
    if (AuthService.isLoggedIn()) {
      const token = AuthService.getAccessToken()
      if (token) {
        const username = AuthService.getUsername(token)
        const role = AuthService.getUserRole(token)
        
        if (username && role) {
          const user = {
            id: username,
            username,
            role,
          }
          setCurrentUser(user)
          setIsLoggedIn(true)
          setActiveTab(getDefaultTab(role))
        }
      }
    }
  }, [])

  const handleLogin = async (username: string, password: string) => {
    try {
      const tokenData = await AuthService.login(username, password)
      const role = AuthService.getUserRole(tokenData.access_token)
      const userUsername = AuthService.getUsername(tokenData.access_token)
      
      const user = {
        id: userUsername || username,
        username: userUsername || username,
        role: role || "viewer",
      }
      
      setCurrentUser(user)
      setIsLoggedIn(true)
      setActiveTab(getDefaultTab(user.role))
    } catch (error) {
      console.error("Login failed:", error)
      throw error 
    }
  }

  const handleLogout = () => {
    AuthService.clearTokens()
    setCurrentUser(null)
    setIsLoggedIn(false)
    setActiveTab("login")
  }

  const handleTabChange = (tab: Tabs) => {
    if (canAccessTab(currentUser?.role || null, tab)) {
      setActiveTab(tab)
    } else {
      console.warn(`Access denied to tab: ${tab}`)
    }
  }

  const handleDeleteTeam = (id: string | number) => {
    if (!permissions.canEditTeams) {
      alert("You don't have permission to delete teams")
      return
    }
  }
  
  const handleExport = () => {
    if (!permissions.canExport) {
      alert("You don't have permission to export data")
      return
    }
  }  

  return (
    <SideBarLayout 
      activeTab={activeTab} 
      setActiveTab={handleTabChange}
      userRole={currentUser?.role}
    >
      {activeTab === "leaderboard" && (
        <LeaderboardTab />
      )}
      {activeTab === "teams" && permissions.canEditTeams && (
        <TeamsTab />
      )}
      {activeTab === "challenges" && permissions.canEditChallenges && (
        <ChallengeTab />
      )}
      {activeTab === "users" && permissions.canEditUsers && (
        <UsersTab />
      )}
      {activeTab === "export" && permissions.canExport && (
        <ExportTab
          exportFormat={exportFormat}
          setExportFormat={setExportFormat}
          exportDateRange={exportDateRange}
          setExportDateRange={setExportDateRange}
          handleExport={handleExport}
        />
      )}
      {activeTab === "login" && (
        <LoginTab
          isLoggedIn={isLoggedIn}
          user={currentUser}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
      )}
    </SideBarLayout>
  )
}