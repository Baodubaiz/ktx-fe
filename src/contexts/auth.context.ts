import { createContext } from 'react'
import type { UserInfo } from '@/types/auth'

export interface AuthContextType {
  user: UserInfo | null
  loading: boolean
  login: (token: string, userData?: UserInfo) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>(null as any)
