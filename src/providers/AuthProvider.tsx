import { useEffect, useState } from 'react'
import { AuthContext } from '@/contexts/auth.context'
import { authService } from '@/services/auth.service'
import { setAccessToken } from '@/lib/axios'
import type { UserInfo } from '@/types/auth'
// Import interceptor to register it
import '@/lib/auth-interceptor'

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  // On mount, try to refresh token via HttpOnly cookie
  const bootstrap = async () => {
    try {
      // Try refresh to get a new access token from cookie
      const { accessToken, user: refreshedUser } = await authService.refresh()
      setAccessToken(accessToken)
      setUser(refreshedUser as UserInfo)
    } catch {
      // No valid refresh cookie → user not logged in
      setAccessToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    bootstrap()
  }, [])

  const login = async (token: string, userData?: UserInfo) => {
    setAccessToken(token)
    if (userData) {
      setUser(userData)
    } else {
      // Fetch user profile if not provided
      try {
        const res: any = await authService.getMe()
        setUser(res.data || res)
      } catch {
        setUser(null)
      }
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch {
      // ignore
    }
    setAccessToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
