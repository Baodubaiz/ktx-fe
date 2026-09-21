import { useEffect, useMemo, useState } from 'react'
import { Card, Col, Row, Table, Tag, Select, Space, Typography, Checkbox, Divider, Input, message, Spin, Alert, Button, Modal } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { adminService } from '@/services/admin.service'
import { buildService } from '@/services/build.service'
import type { AdminUser, Permission, Role } from '@/types/admin'
import { useAuth } from '@/hooks/useAuth'
import { PageContainer, PageHeader } from '@/components'
import { PROJECT_OPERATION_TITLE } from '@/constants/project'

const { Text } = Typography

type PermissionAction = 'view' | 'edit' | 'print' | 'import'

interface PermissionModule {
    key: string
    moduleName: string
}

interface PermissionChangeHistory {
    roleId: number
    moduleKey: string
    action: PermissionAction
    previousChecked: boolean
    changedAt: string
}

const permissionModules: PermissionModule[] = [
    { key: 'users', moduleName: 'User' },
    { key: 'roles', moduleName: 'Role' },
    { key: 'permissions', moduleName: 'Permission' },
]

const permissionCodeMap: Record<string, Record<PermissionAction, string[]>> = {
    users: {
        view: ['VIEW-NGUOI-DUNG'],
        edit: ['UPDATE-NGUOI-DUNG-ROLE', 'UPDATE-NGUOI-DUNG-STATUS', 'UPDATE-NGUOI-DUNG-PROFILE', 'CREATE-NGUOI-DUNG'],
        print: [],
        import: [],
    },
    roles: {
        view: ['VIEW-ROLES'],
        edit: ['ROLE-ASSIGN-PERMISSION', 'ROLE-REVOKE-PERMISSION', 'CREATE-ROLES', 'DELETE-ROLES'],
        print: [],
        import: [],
    },
    permissions: {
        view: ['VIEW-PERMISSIONS'],
        edit: ['CREATE-PERMISSIONS', 'DELETE-PERMISSIONS'],
        print: [],
        import: [],
    },
}

const protectedPermissionCodes = [
    'VIEW-NGUOI-DUNG',
    'VIEW-ROLES',
    'VIEW-PERMISSIONS',
    'UPDATE-NGUOI-DUNG-ROLE',
    'ROLE-ASSIGN-PERMISSION',
    'ROLE-REVOKE-PERMISSION',
]

export default function AdminDashboard() {
    const { user: currentUser } = useAuth()
    const [users, setUsers] = useState<AdminUser[]>([])
    const [roles, setRoles] = useState<Role[]>([])
    const [permissions, setPermissions] = useState<Permission[]>([])
    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)
    const [loading, setLoading] = useState(false)
    const [restoring, setRestoring] = useState(false)
    const [updatingUserId, setUpdatingUserId] = useState<number | null>(null)
    const [updatingMatrixKey, setUpdatingMatrixKey] = useState<string | null>(null)
    const [keyword, setKeyword] = useState('')
    const [baselineByRole, setBaselineByRole] = useState<Record<number, number[]>>({})
    const [lastChange, setLastChange] = useState<PermissionChangeHistory | null>(null)
    const [facilities, setFacilities] = useState<string[]>([])
    const [newFacilityName, setNewFacilityName] = useState('')
    const [newFacilityBuildingCode, setNewFacilityBuildingCode] = useState('')
    const [newFacilityBuildingName, setNewFacilityBuildingName] = useState('')
    const [creatingFacility, setCreatingFacility] = useState(false)

    const fetchData = async () => {
        setLoading(true)
        try {
            const [usersData, rolesData, permissionsData, facilitiesData] = await Promise.all([
                adminService.getUsers(),
                adminService.getRoles(),
                adminService.getPermissions(),
                buildService.getFacilities(),
            ])

            setUsers(usersData)
            setRoles(rolesData)
            setPermissions(permissionsData)
            setFacilities(Array.isArray(facilitiesData) ? facilitiesData : [])
            setSelectedRoleId((prev) => prev ?? rolesData[0]?.id ?? null)
            setBaselineByRole((prev) => {
                if (Object.keys(prev).length > 0) {
                    return prev
                }

                return rolesData.reduce<Record<number, number[]>>((accumulator, role) => {
                    accumulator[role.id] = role.permissions.map((item) => item.permissionId)
                    return accumulator
                }, {})
            })
        } catch {
            message.error('Không tải được dữ liệu quản trị')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const selectedRole = useMemo(() => {
        return roles.find((role) => role.id === selectedRoleId) ?? null
    }, [roles, selectedRoleId])

    const selectedRolePermissionIds = useMemo(() => {
        return new Set(selectedRole?.permissions.map((item) => item.permissionId) ?? [])
    }, [selectedRole])

    const filteredUsers = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase()
        if (!normalizedKeyword) return users

        return users.filter((user) => {
            return [
                user.maQuanHam,
                user.hoTen ?? '',
                user.role?.name ?? '',
                user.email ?? '',
            ].some((value) => value.toLowerCase().includes(normalizedKeyword))
        })
    }, [users, keyword])

    const resolvePermissionIds = (moduleKey: string, action: PermissionAction) => {
        const mappedCodes = permissionCodeMap[moduleKey][action]
        const permissionIds = permissions
            .filter((permission) => mappedCodes.includes(permission.code))
            .map((permission) => permission.id)

        return permissionIds
    }

    const isProtectedForCurrentRole = (moduleKey: string, action: PermissionAction) => {
        const currentRoleName = currentUser?.role?.name
        if (!selectedRole || !currentRoleName) {
            return false
        }

        const isCurrentUserRole = selectedRole.name === currentRoleName
        if (!isCurrentUserRole) {
            return false
        }

        const mappedCodes = permissionCodeMap[moduleKey][action]
        return mappedCodes.some((code) => protectedPermissionCodes.includes(code))
    }

    const syncRolePermissions = async (roleId: number, targetPermissionIds: number[]) => {
        const role = roles.find((item) => item.id === roleId)
        if (!role) return

        const currentPermissionSet = new Set(role.permissions.map((item) => item.permissionId))
        const targetPermissionSet = new Set(targetPermissionIds)

        const toAssign = targetPermissionIds.filter((permissionId) => !currentPermissionSet.has(permissionId))
        const toRevoke = Array.from(currentPermissionSet).filter((permissionId) => !targetPermissionSet.has(permissionId))

        await Promise.all([
            ...toAssign.map((permissionId) => adminService.assignPermissionToRole(roleId, permissionId)),
            ...toRevoke.map((permissionId) => adminService.revokePermissionFromRole(roleId, permissionId)),
        ])
    }

    const handleUndoLastChange = async () => {
        if (!lastChange) {
            message.info('Không có thay đổi nào để hoàn tác')
            return
        }

        setUpdatingMatrixKey(`${lastChange.moduleKey}-${lastChange.action}`)
        try {
            await togglePermission(lastChange.moduleKey, lastChange.action, lastChange.previousChecked, false)
            setLastChange(null)
            message.success('Đã hoàn tác thay đổi gần nhất')
        } catch {
            message.error('Hoàn tác thất bại')
        } finally {
            setUpdatingMatrixKey(null)
        }
    }

    const handleRestoreRoleBaseline = async () => {
        if (!selectedRoleId) {
            message.info('Vui lòng chọn role để khôi phục')
            return
        }

        const baseline = baselineByRole[selectedRoleId]
        if (!baseline) {
            message.info('Chưa có mốc ban đầu cho role này')
            return
        }

        setRestoring(true)
        try {
            await syncRolePermissions(selectedRoleId, baseline)
            await fetchData()
            setLastChange(null)
            message.success('Đã khôi phục quyền role về mốc ban đầu khi mở trang')
        } catch {
            message.error('Khôi phục quyền thất bại')
        } finally {
            setRestoring(false)
        }
    }

    const handleRoleChange = async (userId: number, roleId: number) => {
        const selectedRoleOption = roles.find((role) => role.id === roleId)
        if (!selectedRoleOption) return

        try {
            setUpdatingUserId(userId)
            await adminService.updateUserRole(userId, roleId)
            setUsers((prev) =>
                prev.map((user) =>
                    user.id === userId
                        ? {
                            ...user,
                            roleId,
                            role: {
                                id: selectedRoleOption.id,
                                role_id: selectedRoleOption.role_id,
                                name: selectedRoleOption.name,
                                description: selectedRoleOption.description,
                                level: selectedRoleOption.level,
                            },
                        }
                        : user,
                ),
            )
            message.success('Đã cập nhật role người dùng')
        } catch {
            message.error('Cập nhật role thất bại')
        } finally {
            setUpdatingUserId(null)
        }
    }

    const togglePermission = async (moduleKey: string, action: PermissionAction, checked: boolean, trackHistory = true) => {
        if (!selectedRole) return

        const permissionIds = resolvePermissionIds(moduleKey, action)
        if (permissionIds.length === 0) return

        const mappedCodes = permissionCodeMap[moduleKey][action]
        const isProtected = !checked && isProtectedForCurrentRole(moduleKey, action)
        if (isProtected) {
            message.warning(`Không thể gỡ quyền trọng yếu của role hiện tại (${mappedCodes.join(', ')})`)
            return
        }

        const actionKey = `${moduleKey}-${action}`
        const previousChecked = permissionIds.every((id) => selectedRolePermissionIds.has(id))

        try {
            setUpdatingMatrixKey(actionKey)

            if (checked) {
                const missingIds = permissionIds.filter((id) => !selectedRolePermissionIds.has(id))
                await Promise.all(
                    missingIds.map((permissionId) => adminService.assignPermissionToRole(selectedRole.id, permissionId)),
                )
            } else {
                const assignedIds = permissionIds.filter((id) => selectedRolePermissionIds.has(id))
                await Promise.all(
                    assignedIds.map((permissionId) => adminService.revokePermissionFromRole(selectedRole.id, permissionId)),
                )
            }

            await fetchData()
            if (trackHistory) {
                setLastChange({
                    roleId: selectedRole.id,
                    moduleKey,
                    action,
                    previousChecked,
                    changedAt: new Date().toISOString(),
                })
            }
            message.success('Đã cập nhật ma trận quyền')
        } catch {
            message.error('Cập nhật quyền thất bại')
        } finally {
            setUpdatingMatrixKey(null)
        }
    }

    const userColumns: ColumnsType<AdminUser> = [
        {
            title: 'Mã quân hàm',
            dataIndex: 'maQuanHam',
            key: 'maQuanHam',
            width: 140,
        },
        {
            title: 'Họ tên',
            dataIndex: 'hoTen',
            key: 'hoTen',
            render: (value: string | null) => value || '-',
        },
        {
            title: 'Role hiện tại',
            dataIndex: 'role',
            key: 'role',
            width: 180,
            render: (value: AdminUser['role']) => <Tag color="blue">{value?.name || 'Chưa gán'}</Tag>,
        },
        {
            title: 'Gán role',
            key: 'assignRole',
            width: 220,
            render: (_, row) => (
                <Select
                    value={row.roleId}
                    options={roles.map((role) => ({ label: role.name, value: role.id }))}
                    onChange={(roleId) => handleRoleChange(row.id, roleId)}
                    style={{ width: '100%' }}
                    loading={updatingUserId === row.id}
                    disabled={updatingUserId === row.id}
                />
            ),
        },
    ]

    const actions: PermissionAction[] = ['view', 'edit', 'print', 'import']

    const handleDeleteFacility = (facilityName: string) => {
        Modal.confirm({
            title: 'Xác nhận xóa cơ sở',
            content: `Bạn có chắc chắn muốn xóa cơ sở "${facilityName}" không? Hành động này sẽ xóa tất cả các tòa nhà trống (toà nhà không có tầng) thuộc cơ sở này.`,
            okText: 'Có',
            cancelText: 'Không',
            okType: 'danger',
            onOk: async () => {
                try {
                    await buildService.deleteFacility(facilityName)
                    message.success('Đã xóa cơ sở thành công')
                    fetchData()
                } catch (error: any) {
                    const backendMessage = error?.response?.data?.message
                    if (Array.isArray(backendMessage)) {
                        message.error(backendMessage.join(', '))
                    } else {
                        message.error(backendMessage || 'Không thể xóa cơ sở, toà nhà đang có tầng')
                    }
                }
            },
        })
    }

    const handleCreateFacility = async () => {
        const coSo = newFacilityName.trim()
        const maToa = newFacilityBuildingCode.trim().toUpperCase()
        const tenToa = newFacilityBuildingName.trim()

        if (!coSo || !maToa || !tenToa) {
            message.warning('Vui lòng nhập đủ tên cơ sở, mã tòa khởi tạo và tên tòa khởi tạo')
            return
        }

        setCreatingFacility(true)
        try {
            await buildService.createFacility({
                co_so: coSo,
                ma_toa: maToa,
                ten_toa: tenToa,
            })

            message.success('Đã thêm cơ sở mới và đồng bộ vào cơ sở dữ liệu')
            setNewFacilityName('')
            setNewFacilityBuildingCode('')
            setNewFacilityBuildingName('')

            const facilitiesData = await buildService.getFacilities()
            setFacilities(Array.isArray(facilitiesData) ? facilitiesData : [])
        } catch (error: any) {
            const backendMessage = error?.response?.data?.message
            if (Array.isArray(backendMessage)) {
                message.error(backendMessage.join(', '))
            } else {
                message.error(backendMessage || 'Không thể thêm cơ sở mới')
            }
        } finally {
            setCreatingFacility(false)
        }
    }

    if (loading) {
        return (
            <div style={{ minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Spin size="large" />
            </div>
        )
    }

    return (
        <PageContainer>
            <PageHeader
                title="Quản trị hệ thống"
                subtitle={`${PROJECT_OPERATION_TITLE} - Quản lý User/Role/Permission và ma trận quyền`}
                breadcrumbs={[{ label: 'Quản trị hệ thống' }]}
            />

            <Space direction="vertical" size={16} style={{ width: '100%' }}>

                <Alert
                    type="info"
                    showIcon
                    message="Cách dùng ma trận quyền"
                    description="Mỗi ô tương ứng nhóm quyền của 1 phân hệ. Tick = gán quyền, bỏ tick = thu hồi quyền. Ô hiển thị '-' nghĩa là backend chưa có permission code tương ứng nên chưa thể áp dụng."
                />

                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Card title="Quản lý cơ sở (chỉ ADMIN)">
                            <Space direction="vertical" size={12} style={{ width: '100%' }}>
                                <Text type="secondary">
                                    Cơ sở trong hệ thống hiện đang lưu theo trường <strong>co_so</strong> của tòa nhà.
                                    Thao tác bên dưới sẽ tạo cơ sở mới kèm 1 tòa nhà khởi tạo để đồng bộ dữ liệu ngay.
                                </Text>

                                <Row gutter={[12, 12]}>
                                    <Col xs={24} md={8}>
                                        <Input
                                            placeholder="Tên cơ sở (VD: Cơ sở 4)"
                                            value={newFacilityName}
                                            onChange={(event) => setNewFacilityName(event.target.value)}
                                        />
                                    </Col>
                                    <Col xs={24} md={8}>
                                        <Input
                                            placeholder="Mã tòa khởi tạo (VD: CS4-A1)"
                                            value={newFacilityBuildingCode}
                                            onChange={(event) => setNewFacilityBuildingCode(event.target.value)}
                                        />
                                    </Col>
                                    <Col xs={24} md={8}>
                                        <Input
                                            placeholder="Tên tòa khởi tạo"
                                            value={newFacilityBuildingName}
                                            onChange={(event) => setNewFacilityBuildingName(event.target.value)}
                                        />
                                    </Col>
                                </Row>

                                <Space wrap>
                                    <Button type="primary" loading={creatingFacility} onClick={handleCreateFacility}>
                                        Thêm cơ sở mới
                                    </Button>
                                    <Button onClick={fetchData}>
                                        Làm mới danh sách cơ sở
                                    </Button>
                                </Space>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {facilities.length === 0 ? (
                                        <Text type="secondary">Chưa có dữ liệu cơ sở</Text>
                                    ) : (
                                        facilities.map((facility) => (
                                            <Tag
                                                color="blue"
                                                key={facility}
                                                closable
                                                onClose={(e) => {
                                                    e.preventDefault()
                                                    handleDeleteFacility(facility)
                                                }}
                                            >
                                                {facility}
                                            </Tag>
                                        ))
                                    )}
                                </div>
                            </Space>
                        </Card>
                    </Col>

                    <Col span={24}>
                        <Card title="Danh sách user & gán role">
                            <Space direction="vertical" size={12} style={{ width: '100%' }}>
                                <Input.Search
                                    placeholder="Tìm theo mã quân hàm, họ tên, role, email"
                                    value={keyword}
                                    onChange={(event) => setKeyword(event.target.value)}
                                    allowClear
                                />

                                <Table
                                    columns={userColumns}
                                    dataSource={filteredUsers}
                                    pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }}
                                    rowKey="id"
                                />
                            </Space>
                        </Card>
                    </Col>

                    <Col span={24}>
                        <Card title="Ma trận quyền (View / Edit / Print / Import)">
                            <Space direction="vertical" size={12} style={{ width: '100%' }}>
                                <Space align="center" wrap style={{ justifyContent: 'space-between', width: '100%' }}>
                                    <Space align="center" wrap>
                                        <Text strong>Role đang cấu hình:</Text>
                                        <Select
                                            value={selectedRoleId ?? undefined}
                                            style={{ width: 220 }}
                                            options={roles.map((role) => ({ label: role.name, value: role.id }))}
                                            onChange={setSelectedRoleId}
                                        />
                                    </Space>

                                    <Space wrap>
                                        <Button onClick={handleUndoLastChange} disabled={!lastChange}>
                                            Hoàn tác thay đổi gần nhất
                                        </Button>
                                        <Button onClick={handleRestoreRoleBaseline} loading={restoring}>
                                            Khôi phục mốc ban đầu
                                        </Button>
                                    </Space>
                                </Space>

                                <Text type="secondary">
                                    Trạng thái áp dụng: khi bạn tick/bỏ tick và thấy thông báo thành công, quyền đã được ghi nhận ngay trên backend và có hiệu lực ngay.
                                </Text>

                                {lastChange && (
                                    <Text type="secondary">
                                        Thay đổi gần nhất: {lastChange.moduleKey.toUpperCase()} / {lastChange.action.toUpperCase()} lúc {new Date(lastChange.changedAt).toLocaleTimeString('vi-VN')}.
                                    </Text>
                                )}

                                <Divider style={{ margin: '8px 0' }} />

                                <Table
                                    pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }}
                                    rowKey="key"
                                    dataSource={permissionModules}
                                    columns={[
                                        {
                                            title: 'Phân hệ',
                                            dataIndex: 'moduleName',
                                            key: 'moduleName',
                                            width: 220,
                                        },
                                        ...actions.map((action) => ({
                                            title: action.toUpperCase(),
                                            key: action,
                                            align: 'center' as const,
                                            render: (_: unknown, row: PermissionModule) => (
                                                (() => {
                                                    const mappedPermissionIds = resolvePermissionIds(row.key, action)
                                                    const isAvailable = mappedPermissionIds.length > 0
                                                    const checked = isAvailable && mappedPermissionIds.every((id) => selectedRolePermissionIds.has(id))
                                                    const cellKey = `${row.key}-${action}`

                                                    if (!isAvailable) {
                                                        return <Text type="secondary">-</Text>
                                                    }

                                                    const isProtected = checked && isProtectedForCurrentRole(row.key, action)

                                                    return (
                                                        <Checkbox
                                                            checked={checked}
                                                            onChange={(event) => togglePermission(row.key, action, event.target.checked)}
                                                            disabled={!selectedRole || updatingMatrixKey === cellKey || isProtected}
                                                        />
                                                    )
                                                })()
                                            ),
                                        })),
                                    ]}
                                />
                            </Space>
                        </Card>
                    </Col>
                </Row>
            </Space>
        </PageContainer>
    )
}