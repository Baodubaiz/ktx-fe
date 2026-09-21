import { api } from '@/lib/axios'
import type { LoginRequest, LoginResponse, UserInfo } from '@/types/auth'

class AuthService {
    /* ================= LOGIN ================= */
    async login(data: LoginRequest): Promise<LoginResponse> {
        const res = await api.post<LoginResponse>('/auth/login', data)
        return res.data
    }

    /* ================= REFRESH TOKEN ================= */
    async refresh(): Promise<{ accessToken: string; user: UserInfo }> {
        const res = await api.post('/auth/refresh', {}, { withCredentials: true })
        console.log('refresh endpoint hit')

        return {
            accessToken: res.data.data.accessToken,
            user: res.data.data.user
        }
    }


    /* ================= LOGOUT ================= */
    async logout(): Promise<void> {
        await api.post('/auth/logout')
    }

    /* ================= ME ================= */
    async getMe(): Promise<UserInfo> {
        const res = await api.get<UserInfo>('/auth/me')
        return res.data
    }

    // Đổi mật khẩu
    async changePassword(currentPassword: string, newPassword: string): Promise<void> {
        await api.post('/auth/change-password', { currentPassword, newPassword })
    }
}

export const authService = new AuthService()
