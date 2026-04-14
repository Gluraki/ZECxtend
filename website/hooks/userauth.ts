import { useState } from 'react'
import { AuthService } from '@/lib/auth'

interface User {
  id: string
  username: string
  role: string
}

function getInitialUser(): User | null {
  if (!AuthService.isLoggedIn()) {
    return null
  }

  const token = AuthService.getAccessToken()
  if (!token) {
    return null
  }

  const username = AuthService.getUsername(token)
  const role = AuthService.getUserRole(token)
  if (!username || !role) {
    return null
  }

  return {
    id: username,
    username,
    role,
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => getInitialUser())
  const isLoading = false

  const login = async (username: string, password: string) => {
    const tokenData = await AuthService.login(username, password)
    const role = AuthService.getUserRole(tokenData.access_token)
    const userUsername = AuthService.getUsername(tokenData.access_token)
    
    const newUser = {
      id: userUsername || username,
      username: userUsername || username,
      role: role || "no role",
    }
    setUser(newUser)
    return newUser
  }

  const logout = () => {
    AuthService.clearTokens()
    setUser(null)
  }

  const hasRole = (requiredRole: string | string[]): boolean => {
    if (!user) return false
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.some(role => user.role.toLowerCase() === role.toLowerCase())
    }
    
    return user.role.toLowerCase() === requiredRole.toLowerCase()
  }

  const isAdmin = (): boolean => hasRole('admin')
  
  const isManager = (): boolean => hasRole(['admin', 'manager'])

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    hasRole,
    isAdmin,
    isManager,
  }
}
