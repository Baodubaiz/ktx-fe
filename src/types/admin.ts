export interface Permission {
  id: number
  code: string
  description?: string | null
}

export interface RolePermissionLink {
  roleId: number
  permissionId: number
  permission: Permission
}

export interface Role {
  id: number
  role_id: string
  name: string
  description?: string | null
  level: number
  permissions: RolePermissionLink[]
}

export interface AdminUser {
  id: number
  maQuanHam: string
  hoTen: string | null
  soDienThoai: string | null
  email: string | null
  isActive: boolean
  roleId: number
  role: {
    id: number
    role_id: string
    name: string
    description?: string | null
    level: number
  } | null
}
