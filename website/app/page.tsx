"use client"

import { useState, useEffect } from "react"
import TeamsTab from "@/components/tabs/TeamsTab"
import TeamLeadView from "@/components/tabs/TeamLeadView"
import AttemptsTab from "@/components/tabs/AttemptTab"
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

interface AuthState {
  isLoggedIn: boolean
  currentUser: User | null
  activeTab: Tabs
}

function getInitialAuthState(): AuthState {
  if (typeof window === "undefined") {
    return {
      isLoggedIn: false,
      currentUser: null,
      activeTab: "leaderboard",
    }
  }

  if (!AuthService.isLoggedIn()) {
    return {
      isLoggedIn: false,
      currentUser: null,
      activeTab: "leaderboard",
    }
  }

  const token = AuthService.getAccessToken()
  if (!token) {
    return {
      isLoggedIn: false,
      currentUser: null,
      activeTab: "leaderboard",
    }
  }

  const username = AuthService.getUsername(token)
  const role = AuthService.getUserRole(token)
  if (!username || !role) {
    return {
      isLoggedIn: false,
      currentUser: null,
      activeTab: "leaderboard",
    }
  }

  const user = { id: username, username, role }
  return {
    isLoggedIn: true,
    currentUser: user,
    activeTab: getDefaultTab(role),
  }
}

export default function Webapp() {
  const [authState, setAuthState] = useState<AuthState>(() => getInitialAuthState())
  const { isLoggedIn, currentUser, activeTab } = authState
  const [sessionMessage, setSessionMessage] = useState<string | null>(null)
  const permissions = getPermissions(currentUser?.role || null)

  useEffect(() => {
    const handleSessionExpired = () => {
      AuthService.clearTokens()
      setAuthState({
        isLoggedIn: false,
        currentUser: null,
        activeTab: "login",
      })
      setSessionMessage("Your session has expired. Please log in again1.")
    }

    window.addEventListener('auth:session-expired', handleSessionExpired)
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired)
  }, [])

  const handleLoginSuccess = (user: User) => {
    setAuthState({
      isLoggedIn: true,
      currentUser: user,
      activeTab: getDefaultTab(user.role),
    })
    setSessionMessage(null)
  }

  const handleLogout = () => {
    setAuthState({
      isLoggedIn: false,
      currentUser: null,
      activeTab: "login",
    })
    setSessionMessage(null)
  }

  const handleTabChange = (tab: Tabs) => {
    if (canAccessTab(currentUser?.role || null, tab)) {
      setAuthState((prev) => ({ ...prev, activeTab: tab }))
    } else {
      console.warn(`Access denied to tab: ${tab}`)
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
      {activeTab === "attempts" && permissions.canViewAttempts && (
        <AttemptsTab />
      )}
      {activeTab === "teams" && (
        <>
          {currentUser?.role === "teamlead" && permissions.canEditTeams ? (
            <TeamLeadView />
          ) : currentUser?.role === "admin" && permissions.canEditTeams ? (
            <TeamsTab />
          ) : null}
        </>
      )}
      {activeTab === "challenges" && permissions.canEditChallenges && (
        <ChallengeTab />
      )}
      {activeTab === "users" && permissions.canEditUsers && (
        <UsersTab />
      )}
      {activeTab === "export" && permissions.canExport && (
        <ExportTab />
      )}
      {activeTab === "login" && (
        <LoginTab
          isLoggedIn={isLoggedIn}
          user={currentUser}
          onLoginSuccess={handleLoginSuccess}
          onLogout={handleLogout}
          sessionMessage={sessionMessage}
        />
      )}
    </SideBarLayout>
  )
}
