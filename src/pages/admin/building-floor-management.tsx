import { useEffect, useState, useMemo, useCallback } from 'react'
import {
    Card, Table, Button, Space, Modal, Form, Input, InputNumber, Select,
    message, Popconfirm, Tag, Typography, Tabs, Tooltip, Row, Col, Spin
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
    PlusOutlined, EditOutlined, DeleteOutlined,
    BankOutlined, BuildOutlined, ReloadOutlined, SearchOutlined
} from '@ant-design/icons'
import { PageContainer, PageHeader } from '@/components'
import { PROJECT_OPERATION_TITLE } from '@/constants/project'
import { buildService } from '@/services/build.service'
import { floorService } from '@/services/floor.service'
import type { Build, CreateBuildDto, UpdateBuildDto } from '@/types/build'
import type { Floor, CreateFloorDto, UpdateFloorDto } from '@/types/floor'

const { Text } = Typography

// ─── Extend Floor type to include toaNha relation from backend ───
interface FloorWithBuilding extends Floor {
    toaNha?: Build | null
}

export default function BuildingFloorManagement() {
    // ─── State ───
    const [activeTab, setActiveTab] = useState('buildings')
    const [buildings, setBuildings] = useState<Build[]>([])
    const [floors, setFloors] = useState<FloorWithBuilding[]>([])
    const [loadingBuildings, setLoadingBuildings] = useState(false)
    const [loadingFloors, setLoadingFloors] = useState(false)
    const [searchBuilding, setSearchBuilding] = useState('')
    const [searchFloor, setSearchFloor] = useState('')
    const [filterBuildingId, setFilterBuildingId] = useState<number | null>(null)

    // Building modal
    const [buildingModalOpen, setBuildingModalOpen] = useState(false)
    const [editingBuilding, setEditingBuilding] = useState<Build | null>(null)
    const [savingBuilding, setSavingBuilding] = useState(false)
    const [buildingForm] = Form.useForm()

    // Floor modal
    const [floorModalOpen, setFloorModalOpen] = useState(false)
    const [editingFloor, setEditingFloor] = useState<FloorWithBuilding | null>(null)
    const [savingFloor, setSavingFloor] = useState(false)
    const [floorForm] = Form.useForm()

    // ─── Fetch data ───
    const fetchBuildings = useCallback(async () => {
        setLoadingBuildings(true)
        try {
            const data = await buildService.getAll()
            setBuildings(Array.isArray(data) ? data : [])
        } catch {
            message.error('Không tải được danh sách tòa nhà')
        } finally {
            setLoadingBuildings(false)
        }
    }, [])

    const fetchFloors = useCallback(async () => {
        setLoadingFloors(true)
        try {
            const data = await floorService.getAll()
            setFloors(Array.isArray(data) ? data : [])
        } catch {
            message.error('Không tải được danh sách tầng')
        } finally {
            setLoadingFloors(false)
        }
    }, [])

    useEffect(() => {
        fetchBuildings()
        fetchFloors()
    }, [fetchBuildings, fetchFloors])

    // ─── Building CRUD handlers ───
    const handleOpenBuildingModal = (building?: Build) => {
        if (building) {
            setEditingBuilding(building)
            buildingForm.setFieldsValue({
                ma_toa: building.ma_toa,
                ten_toa: building.ten_toa || '',
                co_so: building.co_so || '',
            })
        } else {
            setEditingBuilding(null)
            buildingForm.resetFields()
        }
        setBuildingModalOpen(true)
    }

    const handleSaveBuilding = async () => {
        try {
            const values = await buildingForm.validateFields()
            setSavingBuilding(true)

            if (editingBuilding) {
                const payload: UpdateBuildDto = {
                    ten_toa: values.ten_toa?.trim() || undefined,
                    co_so: values.co_so?.trim() || undefined,
                }
                await buildService.update(editingBuilding.id, payload)
                message.success('Cập nhật tòa nhà thành công')
            } else {
                const payload: CreateBuildDto = {
                    ma_toa: values.ma_toa.trim(),
                    ten_toa: values.ten_toa?.trim() || undefined,
                    co_so: values.co_so?.trim() || undefined,
                }
                await buildService.create(payload)
                message.success('Thêm tòa nhà thành công')
            }

            setBuildingModalOpen(false)
            buildingForm.resetFields()
            setEditingBuilding(null)
            await fetchBuildings()
        } catch (error: any) {
            const backendMessage = error?.response?.data?.message
            if (backendMessage) {
                message.error(Array.isArray(backendMessage) ? backendMessage.join(', ') : backendMessage)
            }
        } finally {
            setSavingBuilding(false)
        }
    }

    const handleDeleteBuilding = async (id: number) => {
        try {
            await buildService.delete(id)
            message.success('Xóa tòa nhà thành công')
            await fetchBuildings()
            await fetchFloors()
        } catch (error: any) {
            const backendMessage = error?.response?.data?.message
            if (backendMessage) {
                message.error(Array.isArray(backendMessage) ? backendMessage.join(', ') : backendMessage)
            } else {
                message.error('Không thể xóa tòa nhà')
            }
        }
    }

    // ─── Floor CRUD handlers ───
    const handleOpenFloorModal = (floor?: FloorWithBuilding) => {
        if (floor) {
            setEditingFloor(floor)
            floorForm.setFieldsValue({
                so_tang: floor.so_tang,
                toa_nha_id: floor.toa_nha_id,
            })
        } else {
            setEditingFloor(null)
            floorForm.resetFields()
        }
        setFloorModalOpen(true)
    }

    const handleSaveFloor = async () => {
        try {
            const values = await floorForm.validateFields()
            setSavingFloor(true)

            if (editingFloor) {
                const payload: UpdateFloorDto = {
                    so_tang: values.so_tang,
                }
                await floorService.update(editingFloor.id, payload)
                message.success('Cập nhật tầng thành công')
            } else {
                const payload: CreateFloorDto = {
                    so_tang: values.so_tang,
                    toa_nha_id: values.toa_nha_id,
                }
                await floorService.create(payload)
                message.success('Thêm tầng thành công')
            }

            setFloorModalOpen(false)
            floorForm.resetFields()
            setEditingFloor(null)
            await fetchFloors()
        } catch (error: any) {
            const backendMessage = error?.response?.data?.message
            if (backendMessage) {
                message.error(Array.isArray(backendMessage) ? backendMessage.join(', ') : backendMessage)
            }
        } finally {
            setSavingFloor(false)
        }
    }

    const handleDeleteFloor = async (id: number) => {
        try {
            await floorService.delete(id)
            message.success('Xóa tầng thành công')
            await fetchFloors()
        } catch (error: any) {
            const backendMessage = error?.response?.data?.message
            if (backendMessage) {
                message.error(Array.isArray(backendMessage) ? backendMessage.join(', ') : backendMessage)
            } else {
                message.error('Không thể xóa tầng')
            }
        }
    }

    // ─── Filtered data ───
    const filteredBuildings = useMemo(() => {
        const kw = searchBuilding.trim().toLowerCase()
        if (!kw) return buildings

        return buildings.filter((b) =>
            [b.ma_toa, b.ten_toa || '', b.co_so || '']
                .some((v) => v.toLowerCase().includes(kw))
        )
    }, [buildings, searchBuilding])

    const filteredFloors = useMemo(() => {
        let result = floors

        if (filterBuildingId) {
            result = result.filter((f) => f.toa_nha_id === filterBuildingId)
        }

        const kw = searchFloor.trim().toLowerCase()
        if (kw) {
            result = result.filter((f) =>
                [
                    f.so_tang?.toString() || '',
                    f.toaNha?.ma_toa || '',
                    f.toaNha?.ten_toa || '',
                ].some((v) => v.toLowerCase().includes(kw))
            )
        }

        return result
    }, [floors, searchFloor, filterBuildingId])

    // ─── Building stats ───
    const buildingFloorCount = useMemo(() => {
        const map: Record<number, number> = {}
        for (const f of floors) {
            if (f.toa_nha_id) {
                map[f.toa_nha_id] = (map[f.toa_nha_id] || 0) + 1
            }
        }
        return map
    }, [floors])

    // ─── Table columns ───
    const buildingColumns: ColumnsType<Build> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 70,
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Mã tòa',
            dataIndex: 'ma_toa',
            key: 'ma_toa',
            width: 140,
            sorter: (a, b) => a.ma_toa.localeCompare(b.ma_toa),
            render: (value: string) => <Text strong>{value}</Text>,
        },
        {
            title: 'Tên tòa',
            dataIndex: 'ten_toa',
            key: 'ten_toa',
            render: (value: string | null) => value || <Text type="secondary">—</Text>,
        },
        {
            title: 'Cơ sở',
            dataIndex: 'co_so',
            key: 'co_so',
            width: 160,
            filters: [...new Set(buildings.map((b) => b.co_so).filter(Boolean))]
                .map((v) => ({ text: v!, value: v! })),
            onFilter: (value, record) => record.co_so === value,
            render: (value: string | null) =>
                value ? <Tag color="blue">{value}</Tag> : <Text type="secondary">—</Text>,
        },
        {
            title: 'Số tầng',
            key: 'floorCount',
            width: 100,
            align: 'center',
            render: (_, record) => {
                const count = buildingFloorCount[record.id] || 0
                return count > 0
                    ? <Tag color="green">{count} tầng</Tag>
                    : <Text type="secondary">0</Text>
            },
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 140,
            align: 'center',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleOpenBuildingModal(record)}
                            style={{ color: '#1677ff' }}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa tòa nhà"
                        description={`Bạn chắc chắn muốn xóa tòa "${record.ma_toa}"?`}
                        onConfirm={() => handleDeleteBuilding(record.id)}
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
            ),
        },
    ]

    const floorColumns: ColumnsType<FloorWithBuilding> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 70,
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Số tầng',
            dataIndex: 'so_tang',
            key: 'so_tang',
            width: 120,
            sorter: (a, b) => (a.so_tang ?? 0) - (b.so_tang ?? 0),
            render: (value: number | null) =>
                value != null ? <Text strong>Tầng {value}</Text> : <Text type="secondary">—</Text>,
        },
        {
            title: 'Tòa nhà',
            key: 'toaNha',
            render: (_, record) => {
                if (record.toaNha) {
                    return (
                        <Space size="small">
                            <Tag color="blue">{record.toaNha.ma_toa}</Tag>
                            <Text type="secondary">{record.toaNha.ten_toa || ''}</Text>
                        </Space>
                    )
                }
                return <Text type="secondary">—</Text>
            },
        },
        {
            title: 'Cơ sở',
            key: 'coSo',
            width: 160,
            render: (_, record) =>
                record.toaNha?.co_so
                    ? <Tag color="cyan">{record.toaNha.co_so}</Tag>
                    : <Text type="secondary">—</Text>,
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 140,
            align: 'center',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleOpenFloorModal(record)}
                            style={{ color: '#1677ff' }}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa tầng"
                        description={`Bạn chắc chắn muốn xóa tầng ${record.so_tang ?? ''} này?`}
                        onConfirm={() => handleDeleteFloor(record.id)}
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
            ),
        },
    ]

    // ─── Building options for select ───
    const buildingOptions = useMemo(() =>
        buildings.map((b) => ({
            label: `${b.ma_toa}${b.ten_toa ? ` – ${b.ten_toa}` : ''}`,
            value: b.id,
        })),
    [buildings])

    // ─── Loading state ───
    if (loadingBuildings && loadingFloors && buildings.length === 0 && floors.length === 0) {
        return (
            <div style={{ minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Spin size="large" />
            </div>
        )
    }

    return (
        <PageContainer>
            <PageHeader
                title="Quản lý Tòa nhà & Tầng"
                subtitle={`${PROJECT_OPERATION_TITLE} – Thêm, sửa, xóa tòa nhà và tầng (chỉ Admin)`}
                breadcrumbs={[
                    { label: 'Quản trị hệ thống', path: '/admin' },
                    { label: 'Tòa nhà & Tầng' },
                ]}
            />

            <Card>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={[
                        {
                            key: 'buildings',
                            label: (
                                <span>
                                    <BankOutlined style={{ marginRight: 6 }} />
                                    Tòa nhà ({buildings.length})
                                </span>
                            ),
                            children: (
                                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                                    <Row gutter={[12, 12]} align="middle" justify="space-between">
                                        <Col xs={24} sm={12} md={8}>
                                            <Input
                                                placeholder="Tìm theo mã tòa, tên tòa, cơ sở..."
                                                prefix={<SearchOutlined />}
                                                value={searchBuilding}
                                                onChange={(e) => setSearchBuilding(e.target.value)}
                                                allowClear
                                            />
                                        </Col>
                                        <Col>
                                            <Space>
                                                <Button
                                                    icon={<ReloadOutlined />}
                                                    onClick={fetchBuildings}
                                                    loading={loadingBuildings}
                                                >
                                                    Làm mới
                                                </Button>
                                                <Button
                                                    type="primary"
                                                    icon={<PlusOutlined />}
                                                    onClick={() => handleOpenBuildingModal()}
                                                >
                                                    Thêm tòa nhà
                                                </Button>
                                            </Space>
                                        </Col>
                                    </Row>

                                    <Table
                                        columns={buildingColumns}
                                        dataSource={filteredBuildings}
                                        rowKey="id"
                                        loading={loadingBuildings}
                                        pagination={{
                                            pageSize: 10,
                                            showSizeChanger: true,
                                            pageSizeOptions: ['10', '20', '50'],
                                            showTotal: (total) => `Tổng ${total} tòa nhà`,
                                        }}
                                        size="middle"
                                        scroll={{ x: 700 }}
                                    />
                                </Space>
                            ),
                        },
                        {
                            key: 'floors',
                            label: (
                                <span>
                                    <BuildOutlined style={{ marginRight: 6 }} />
                                    Tầng ({floors.length})
                                </span>
                            ),
                            children: (
                                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                                    <Row gutter={[12, 12]} align="middle" justify="space-between">
                                        <Col xs={24} sm={8} md={6}>
                                            <Select
                                                placeholder="Lọc theo tòa nhà"
                                                options={[
                                                    { label: 'Tất cả tòa nhà', value: 0 },
                                                    ...buildingOptions,
                                                ]}
                                                value={filterBuildingId ?? 0}
                                                onChange={(v) => setFilterBuildingId(v === 0 ? null : v)}
                                                style={{ width: '100%' }}
                                                allowClear
                                                onClear={() => setFilterBuildingId(null)}
                                            />
                                        </Col>
                                        <Col xs={24} sm={8} md={6}>
                                            <Input
                                                placeholder="Tìm theo số tầng, mã tòa..."
                                                prefix={<SearchOutlined />}
                                                value={searchFloor}
                                                onChange={(e) => setSearchFloor(e.target.value)}
                                                allowClear
                                            />
                                        </Col>
                                        <Col>
                                            <Space>
                                                <Button
                                                    icon={<ReloadOutlined />}
                                                    onClick={fetchFloors}
                                                    loading={loadingFloors}
                                                >
                                                    Làm mới
                                                </Button>
                                                <Button
                                                    type="primary"
                                                    icon={<PlusOutlined />}
                                                    onClick={() => handleOpenFloorModal()}
                                                >
                                                    Thêm tầng
                                                </Button>
                                            </Space>
                                        </Col>
                                    </Row>

                                    <Table
                                        columns={floorColumns}
                                        dataSource={filteredFloors}
                                        rowKey="id"
                                        loading={loadingFloors}
                                        pagination={{
                                            pageSize: 10,
                                            showSizeChanger: true,
                                            pageSizeOptions: ['10', '20', '50'],
                                            showTotal: (total) => `Tổng ${total} tầng`,
                                        }}
                                        size="middle"
                                        scroll={{ x: 600 }}
                                    />
                                </Space>
                            ),
                        },
                    ]}
                />
            </Card>

            {/* ──── Building Modal ──── */}
            <Modal
                title={editingBuilding ? 'Chỉnh sửa tòa nhà' : 'Thêm tòa nhà mới'}
                open={buildingModalOpen}
                onOk={handleSaveBuilding}
                onCancel={() => {
                    setBuildingModalOpen(false)
                    setEditingBuilding(null)
                    buildingForm.resetFields()
                }}
                confirmLoading={savingBuilding}
                okText={editingBuilding ? 'Cập nhật' : 'Thêm mới'}
                cancelText="Hủy"
                destroyOnClose
            >
                <Form
                    form={buildingForm}
                    layout="vertical"
                    style={{ marginTop: 16 }}
                >
                    <Form.Item
                        name="ma_toa"
                        label="Mã tòa"
                        rules={[{ required: true, message: 'Vui lòng nhập mã tòa' }]}
                    >
                        <Input
                            placeholder="VD: A1, B2, CS3-A1..."
                            disabled={!!editingBuilding}
                            style={editingBuilding ? { backgroundColor: '#f5f5f5' } : undefined}
                        />
                    </Form.Item>

                    <Form.Item
                        name="ten_toa"
                        label="Tên tòa"
                        rules={[{ required: true, message: 'Vui lòng nhập tên tòa' }]}
                    >
                        <Input placeholder="VD: Tòa A1, Nhà B2..." />
                    </Form.Item>

                    <Form.Item
                        name="co_so"
                        label="Cơ sở"
                    >
                        <Input placeholder="VD: Cơ sở 1, Cơ sở 2..." />
                    </Form.Item>
                </Form>
            </Modal>

            {/* ──── Floor Modal ──── */}
            <Modal
                title={editingFloor ? 'Chỉnh sửa tầng' : 'Thêm tầng mới'}
                open={floorModalOpen}
                onOk={handleSaveFloor}
                onCancel={() => {
                    setFloorModalOpen(false)
                    setEditingFloor(null)
                    floorForm.resetFields()
                }}
                confirmLoading={savingFloor}
                okText={editingFloor ? 'Cập nhật' : 'Thêm mới'}
                cancelText="Hủy"
                destroyOnClose
            >
                <Form
                    form={floorForm}
                    layout="vertical"
                    style={{ marginTop: 16 }}
                >
                    <Form.Item
                        name="toa_nha_id"
                        label="Tòa nhà"
                        rules={[{ required: true, message: 'Vui lòng chọn tòa nhà' }]}
                    >
                        <Select
                            placeholder="Chọn tòa nhà"
                            options={buildingOptions}
                            showSearch
                            optionFilterProp="label"
                            disabled={!!editingFloor}
                            style={editingFloor ? { backgroundColor: '#f5f5f5' } : undefined}
                        />
                    </Form.Item>

                    <Form.Item
                        name="so_tang"
                        label="Số tầng"
                        rules={[
                            { required: true, message: 'Vui lòng nhập số tầng' },
                            { type: 'number', min: 1, message: 'Số tầng phải lớn hơn 0' },
                        ]}
                    >
                        <InputNumber
                            placeholder="VD: 1, 2, 3..."
                            style={{ width: '100%' }}
                            min={1}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </PageContainer>
    )
}
