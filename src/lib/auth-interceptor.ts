// src/lib/auth-interceptor.ts
// Axios interceptor for automatic token refresh using HttpOnly cookies
import { api, setAccessToken } from './axios'
import { authService } from '@/services/auth.service'

let isRefreshing = false
let queue: ((token: string) => void)[] = []
let is403Refreshing = false
let queue403: ((token: string) => void)[] = []

/* Refresh when 401 */
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    // Handle 403 Forbidden: may be stale JWT permissions — refresh token once and retry
    if (error.response?.status === 403 &&
      !original._403retry &&
      !original.url?.includes('/auth/refresh')) {
      original._403retry = true

      if (is403Refreshing) {
        return new Promise((resolve) => {
          queue403.push((token) => {
            original.headers.Authorization = `Bearer ${token}`
            resolve(api(original))
          })
        })
      }

      is403Refreshing = true

      try {
        const { accessToken: newToken } = await authService.refresh()
        setAccessToken(newToken)
        queue403.forEach((cb) => cb(newToken))
        queue403 = []
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch {
        // If refresh also fails on 403, just reject with original error
        return Promise.reject(error)
      } finally {
        is403Refreshing = false
      }
    }

    if (error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/auth/refresh')) {
      original._retry = true

      if (isRefreshing) {
        return new Promise((resolve) => {
          queue.push((token) => {
            original.headers.Authorization = `Bearer ${token}`
            resolve(api(original))
          })
        })
      }

      isRefreshing = true

      try {
        const { accessToken: newToken } = await authService.refresh()
        setAccessToken(newToken)

        queue.forEach((cb) => cb(newToken))
        queue = []

        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch {
        setAccessToken(null)
        window.location.href = '/'
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)
