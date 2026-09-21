import { api } from '@/lib/axios'
import type { AdminUser, Permission, Role } from '@/types/admin'

export const adminService = {
  getUsers: async (): Promise<AdminUser[]> => {
    const res = await api.get('/nguoi-dung')
    return res.data.data ?? res.data
  },

  updateUserRole: async (userId: number, roleId: number) => {
    const res = await api.patch(`/nguoi-dung/${userId}/role`, { roleId })
    return res.data.data ?? res.data
  },

  getRoles: async (): Promise<Role[]> => {
    const res = await api.get('/roles')
    return res.data.data ?? res.data
  },

  getPermissions: async (): Promise<Permission[]> => {
    const res = await api.get('/permissions')
    return res.data.data ?? res.data
  },

  assignPermissionToRole: async (roleId: number, permissionId: number) => {
    const res = await api.post(`/roles/${roleId}/permissions`, { permissionId })
    return res.data.data ?? res.data
  },

  revokePermissionFromRole: async (roleId: number, permissionId: number) => {
    const res = await api.delete(`/roles/${roleId}/permissions/${permissionId}`)
    return res.data.data ?? res.data
  },
}
