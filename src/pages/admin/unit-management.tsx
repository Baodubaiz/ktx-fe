import { useEffect, useState, useMemo, useCallback } from 'react'
import {
    Card, Table, Button, Space, Modal, Form, Input, InputNumber, Select,
    message, Popconfirm, Tag, Typography, Tooltip, Row, Col
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
    PlusOutlined, EditOutlined, DeleteOutlined,
    ReloadOutlined, SearchOutlined,
    UserOutlined
} from '@ant-design/icons'
import { PageContainer, PageHeader } from '@/components'
import { PROJECT_OPERATION_TITLE } from '@/constants/project'
import { unitService } from '@/services/unit.service'
import { adminService } from '@/services/admin.service'
import type { Unit } from '@/types/unit'
import type { AdminUser } from '@/types/admin'
import { systemTheme } from '@/theme/system-theme'

const { Text } = Typography

export default function UnitManagement() {
    const [units, setUnits] = useState<Unit[]>([])
    const [users, setUsers] = useState<AdminUser[]>([])
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    // Modal state
    const [modalOpen, setModalOpen] = useState(false)
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
    const [saving, setSaving] = useState(false)
    const [form] = Form.useForm()

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const [unitData, userData] = await Promise.all([
                unitService.getAll(),
                adminService.getUsers()
            ])
            setUnits(Array.isArray(unitData) ? unitData : [])
            setUsers(Array.isArray(userData) ? userData : [])
        } catch {
            message.error('Không tải được danh sách dữ liệu')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleOpenModal = (unit?: Unit) => {
        if (unit) {
            setEditingUnit(unit)
            form.setFieldsValue({
                ma_don_vi: unit.ma_don_vi,
                ten_don_vi: unit.ten_don_vi || '',
                cap_do: unit.cap_do || 1,
                don_vi_cha: unit.don_vi_cha || null,
                chu_nhiem_id: unit.chu_nhiem_id || null,
                quan_so: unit.quan_so || 0,
            })
        } else {
            setEditingUnit(null)
            form.resetFields()
        }
        setModalOpen(true)
    }

    const handleSave = async () => {
        try {
            const values = await form.validateFields()
            setSaving(true)

            if (editingUnit) {
                await unitService.update(editingUnit.id, values)
                message.success('Cập nhật đơn vị thành công')
            } else {
                await unitService.create(values)
                message.success('Thêm đơn vị thành công')
            }

            setModalOpen(false)
            form.resetFields()
            setEditingUnit(null)
            fetchData()
        } catch (error: any) {
            const backendMessage = error?.response?.data?.message
            if (backendMessage) {
                message.error(Array.isArray(backendMessage) ? backendMessage.join(', ') : backendMessage)
            }
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: number) => {
        try {
            await unitService.delete(id)
            message.success('Xóa đơn vị thành công')
            fetchData()
        } catch (error: any) {
            const backendMessage = error?.response?.data?.message
            if (backendMessage) {
                message.error(Array.isArray(backendMessage) ? backendMessage.join(', ') : backendMessage)
            } else {
                message.error('Không thể xóa đơn vị')
            }
        }
    }

    const filteredUnits = useMemo(() => {
        const kw = searchQuery.trim().toLowerCase()
        if (!kw) return units

        return units.filter((u) =>
            [u.ma_don_vi, u.ten_don_vi || ''].some((v) => v.toLowerCase().includes(kw))
        )
    }, [units, searchQuery])

    const columns: ColumnsType<Unit> = [
        {
            title: 'Mã đơn vị',
            dataIndex: 'ma_don_vi',
            key: 'ma_don_vi',
            width: 150,
            render: (val) => <Text strong>{val}</Text>
        },
        {
            title: 'Tên đơn vị',
            dataIndex: 'ten_don_vi',
            key: 'ten_don_vi',
            render: (val) => val || <Text type="secondary">—</Text>
        },
        {
            title: 'Cấp độ',
            dataIndex: 'cap_do',
            key: 'cap_do',
            width: 100,
            align: 'center',
            render: (val) => <Tag color={val === 1 ? 'blue' : 'green'}>Cấp {val}</Tag>
        },
        {
            title: 'Quân số',
            dataIndex: 'quan_so',
            key: 'quan_so',
            width: 100,
            align: 'center',
            render: (val) => <Tag color="orange">{val || 0}</Tag>
        },
        {
            title: 'Chủ nhiệm',
            key: 'chuNhiem',
            render: (_, record) => record.chuNhiem ? (
                <Space>
                    <UserOutlined />
                    <Text>{record.chuNhiem.hoTen}</Text>
                    <Text type="secondary">({record.chuNhiem.maQuanHam})</Text>
                </Space>
            ) : <Text type="secondary">—</Text>
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 120,
            align: 'center',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleOpenModal(record)}
                            style={{ color: systemTheme.brand.primary }}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa đơn vị"
                        description={`Xác nhận xóa đơn vị "${record.ma_don_vi}"?`}
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Xóa">
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            )
        }
    ]

    return (
        <PageContainer>
            <PageHeader
                title="Quản lý Đơn vị đội"
                subtitle={`${PROJECT_OPERATION_TITLE} – Quản lý danh sách các đội, trung đội (chỉ Admin)`}
                breadcrumbs={[
                    { label: 'Quản trị hệ thống', path: '/admin' },
                    { label: 'Đơn vị đội' },
                ]}
            />

            <Card>
                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                    <Row gutter={[12, 12]} align="middle" justify="space-between">
                        <Col xs={24} sm={12} md={8}>
                            <Input
                                placeholder="Tìm theo mã, tên đơn vị..."
                                prefix={<SearchOutlined />}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                allowClear
                            />
                        </Col>
                        <Col>
                            <Space>
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={fetchData}
                                    loading={loading}
                                >
                                    Làm mới
                                </Button>
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => handleOpenModal()}
                                >
                                    Thêm đơn vị
                                </Button>
                            </Space>
                        </Col>
                    </Row>

                    <Table
                        columns={columns}
                        dataSource={filteredUnits}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng ${total} đơn vị`,
                        }}
                        size="middle"
                    />
                </Space>
            </Card>

            <Modal
                title={editingUnit ? 'Chỉnh sửa đơn vị' : 'Thêm đơn vị mới'}
                open={modalOpen}
                onOk={handleSave}
                onCancel={() => setModalOpen(false)}
                confirmLoading={saving}
                okText={editingUnit ? 'Cập nhật' : 'Thêm mới'}
                cancelText="Hủy"
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    style={{ marginTop: 16 }}
                >
                    <Form.Item
                        name="ma_don_vi"
                        label="Mã đơn vị"
                        rules={[{ required: true, message: 'Vui lòng nhập mã đơn vị' }]}
                    >
                        <Input placeholder="VD: DOI_01, TD01..." disabled={!!editingUnit} />
                    </Form.Item>

                    <Form.Item
                        name="ten_don_vi"
                        label="Tên đơn vị"
                        rules={[{ required: true, message: 'Vui lòng nhập tên đơn vị' }]}
                    >
                        <Input placeholder="VD: Đội 1, Trung đội 1..." />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="cap_do"
                                label="Cấp độ"
                                initialValue={1}
                            >
                                <InputNumber min={1} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="quan_so"
                                label="Quân số"
                                initialValue={0}
                            >
                                <InputNumber min={0} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="don_vi_cha"
                        label="Đơn vị cấp trên"
                    >
                        <Select
                            placeholder="Chọn đơn vị cấp trên"
                            options={units
                                .filter(u => u.id !== editingUnit?.id)
                                .map(u => ({ label: u.ten_don_vi || u.ma_don_vi, value: u.id }))}
                            allowClear
                            showSearch
                        />
                    </Form.Item>

                    <Form.Item
                        name="chu_nhiem_id"
                        label="Chủ nhiệm"
                    >
                        <Select
                            placeholder="Chọn người chủ nhiệm"
                            options={users.map(u => ({ label: `${u.hoTen} (${u.maQuanHam})`, value: u.id }))}
                            allowClear
                            showSearch
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </PageContainer>
    )
}
