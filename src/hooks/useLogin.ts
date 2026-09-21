import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { message } from 'antd'
import { authService } from '@/services/auth.service'
import { setAccessToken } from '@/lib/axios'
import { useAuth } from '@/hooks/useAuth'

export function useLogin() {
  const navigate = useNavigate()
  const { login: authContextLogin } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = async (data: { username: string; password: string }) => {
    try {
      setLoading(true)
      setError(null)

      const res = await authService.login({
        maQuanHam: data.username,
        password: data.password,
      })

      const token = res.data.accessToken
      setAccessToken(token)
      await authContextLogin(token, res.data.user)

      // Navigate based on role
      const user = res.data.user
      const isAdmin = user.role?.name === 'ADMIN' || user.roleId === 1
      navigate(isAdmin ? '/admin' : '/trang-chu')

      return res
    } catch {
      // Generic error message for security
      setError('Sai mã quân hàm hoặc mật khẩu')
      message.error('Sai mã quân hàm hoặc mật khẩu')
    } finally {
      setLoading(false)
    }
  }

  return { login, loading, error }
}
