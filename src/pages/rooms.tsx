import { useEffect, useMemo, useState } from 'react'
import {
  Button, Table, Card, Modal, Form, Input, InputNumber,
  Select, Space, Row, Col, message, Popconfirm, Tag,
} from 'antd'
import { PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useLocation } from 'react-router-dom'
import { PageHeader, PageContainer } from '@/components'
import useRoom from '@/hooks/useRoom'
import { useBuild } from '@/hooks/useBuild'
import { floorService } from '@/services/floor.service'
import type { CreateRoomDto, UpdateRoomDto } from '@/types/room'
import type { ColumnsType } from 'antd/es/table'

export default function Rooms() {
  const location = useLocation()
  const { rooms, loading, fetchAll, create, update, remove } = useRoom()
  const { builds, getBuilds } = useBuild()

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  // Filter state
  const [toaFilter, setToaFilter] = useState<string | undefined>(undefined)
  const [tangFilter, setTangFilter] = useState<number | undefined>(undefined)
  const [loaiFilter, setLoaiFilter] = useState<string | undefined>(undefined)
  const [gioiTinhFilter, setGioiTinhFilter] = useState<string | undefined>(undefined)

  // Form floor options
  const [formFloors, setFormFloors] = useState<any[]>([])

  useEffect(() => {
    fetchAll()
    getBuilds()
  }, [])

  // Floors fetched from API for the filter
  const [filterFloors, setFilterFloors] = useState<any[]>([])

  useEffect(() => {
    if (toaFilter) {
      floorService.getByBuild(Number(toaFilter))
        .then((data) => setFilterFloors(data))
        .catch(() => setFilterFloors([]))
    } else {
      setFilterFloors([])
    }
  }, [toaFilter])

  // Derived filter options - use API floors data
  const tangOptions = useMemo(() => {
    return filterFloors
      .map((f) => f.so_tang)
      .filter((v): v is number => v != null)
  }, [filterFloors])

  // Static options - always show all possible filter values
  const loaiOptions: string[] = ['HOC_VIEN', 'CAN_BO']
  const gioiTinhOptions: string[] = ['NAM', 'NU']

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      if (toaFilter && r.tang?.toa_nha_id?.toString() !== toaFilter) return false
      if (tangFilter != null && r.tang?.so_tang !== tangFilter) return false
      if (loaiFilter && r.loai_phong !== loaiFilter) return false
      if (gioiTinhFilter && r.gioi_tinh_phong !== gioiTinhFilter) return false
      return true
    })
  }, [rooms, toaFilter, tangFilter, loaiFilter, gioiTinhFilter])

  // Open modal
  const openCreate = () => {
    setEditId(null)
    form.resetFields()
    setFormFloors([])
    setModalOpen(true)
  }

  // Auto-open add modal when navigated from dashboard Quick Actions
  useEffect(() => {
    if (location.state?.openAdd) {
      openCreate()
      window.history.replaceState({}, '')
    }
  }, [location.state])

  const openEdit = (record: any) => {
    setEditId(record.id)
    const toaId = record.tang?.toa_nha_id?.toString() ?? record.tang?.toaNha?.id?.toString()
    form.setFieldsValue({
      ma_phong: record.ma_phong,
      toa_nha_id: toaId ? Number(toaId) : undefined,
      tang_id: record.tang_id ?? record.tang?.id,
      so_giuong: record.so_giuong,
      loai_phong: record.loai_phong,
      gioi_tinh_phong: record.gioi_tinh_phong,
    })
    // Load floors for this building
    if (toaId) {
      floorService.getByBuild(Number(toaId))
        .then((data) => setFormFloors(data))
        .catch(() => setFormFloors([]))
    }
    setModalOpen(true)
  }

  // Watch building changes in form to load floors
  const handleBuildChange = (buildId: number) => {
    form.setFieldValue('tang_id', undefined)
    if (buildId) {
      floorService.getByBuild(buildId)
        .then((data) => setFormFloors(data))
        .catch(() => setFormFloors([]))
    } else {
      setFormFloors([])
    }
  }

  // Submit
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)

      const payload: CreateRoomDto | UpdateRoomDto = {
        ma_phong: values.ma_phong,
        tang_id: values.tang_id,
        so_giuong: values.so_giuong ?? undefined,
        loai_phong: values.loai_phong ?? undefined,
        gioi_tinh_phong: values.gioi_tinh_phong ?? undefined,
      }

      if (editId) {
        await update(editId, payload)
        message.success('Cập nhật phòng thành công')
      } else {
        await create(payload as CreateRoomDto)
        message.success('Tạo phòng thành công')
      }
      setModalOpen(false)
      form.resetFields()
    } catch (err: any) {
      if (err?.errorFields) return // validation error
      message.error('Thao tác thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  // Delete
  const handleDelete = async (id: number) => {
    try {
      await remove(id)
      message.success('Xóa phòng thành công')
    } catch {
      message.error('Xóa phòng thất bại')
    }
  }

  // Reset filters
  const resetFilters = () => {
    setToaFilter(undefined)
    setTangFilter(undefined)
    setLoaiFilter(undefined)
    setGioiTinhFilter(undefined)
  }

  // Table columns
  const columns: ColumnsType<any> = [
    { title: 'Mã phòng', dataIndex: 'ma_phong', key: 'ma_phong', width: 120 },
    {
      title: 'Tòa', key: 'toa',
      render: (_, r) => r.tang?.toaNha?.ten_toa ?? (r.tang?.toa_nha_id ? `Tòa #${r.tang.toa_nha_id}` : '-'),
    },
    {
      title: 'Tầng', key: 'tang',
      render: (_, r) => r.tang?.so_tang ?? '-',
      width: 80,
    },
    {
      title: 'Loại', dataIndex: 'loai_phong', key: 'loai_phong', width: 120,
      render: (v) => v ? <Tag color={v === 'HOC_VIEN' ? 'blue' : 'green'}>{v === 'HOC_VIEN' ? 'Học Viên' : (v === 'CAN_BO' ? 'Cán Bộ' : v)}</Tag> : '-',
    },
    {
      title: 'Giới tính', dataIndex: 'gioi_tinh_phong', key: 'gioi_tinh', width: 100,
      render: (v) => v ? <Tag color={v === 'NAM' ? 'cyan' : 'pink'}>{v === 'NAM' ? 'Nam' : (v === 'NU' ? 'Nữ' : v)}</Tag> : '-',
    },
    { title: 'Số giường', dataIndex: 'so_giuong', key: 'so_giuong', width: 100, render: (v) => v ?? '-' },
    {
      title: 'Hành động', key: 'actions', width: 120, align: 'center' as const,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="Xác nhận xóa phòng?" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        title="Quản lý phòng"
        subtitle="Quản lý thông tin toàn bộ phòng ở trong ký túc xá"
        breadcrumbs={[{ label: 'Quản lý phòng' }]}
        extra={
          <>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm phòng</Button>
            <Button icon={<ReloadOutlined />} onClick={() => fetchAll()} loading={loading}>Làm mới</Button>
          </>
        }
      />

      <Row gutter={16}>
        {/* Filter sidebar */}
        <Col xs={24} md={6}>
          <Card title="Bộ lọc" size="small">
            <Space direction="vertical" style={{ width: '100%' }} size={12}>
              <div>
                <div style={{ fontSize: 11, color: '#999', fontWeight: 600, marginBottom: 4 }}>Tòa</div>
                <Select
                  placeholder="Tất cả" allowClear value={toaFilter}
                  onChange={setToaFilter} style={{ width: '100%' }}
                  options={builds.map((b) => ({ value: b.id.toString(), label: b.ten_toa ?? b.ma_toa }))}
                />
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#999', fontWeight: 600, marginBottom: 4 }}>Tầng</div>
                <Select
                  placeholder="Tất cả" allowClear value={tangFilter}
                  onChange={setTangFilter} style={{ width: '100%' }}
                  options={tangOptions.map((t) => ({ value: t, label: `Tầng ${t}` }))}
                />
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#999', fontWeight: 600, marginBottom: 4 }}>Loại phòng</div>
                <Select
                  placeholder="Tất cả" allowClear value={loaiFilter}
                  onChange={setLoaiFilter} style={{ width: '100%' }}
                  options={loaiOptions.map((l) => ({ value: l, label: l === 'HOC_VIEN' ? 'Học Viên' : (l === 'CAN_BO' ? 'Cán Bộ' : l) }))}
                />
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#999', fontWeight: 600, marginBottom: 4 }}>Giới tính</div>
                <Select
                  placeholder="Tất cả" allowClear value={gioiTinhFilter}
                  onChange={setGioiTinhFilter} style={{ width: '100%' }}
                  options={gioiTinhOptions.map((g) => ({ value: g, label: g === 'NAM' ? 'Nam' : (g === 'NU' ? 'Nữ' : g) }))}
                />
              </div>
              <Button block onClick={resetFilters}>Đặt lại bộ lọc</Button>
            </Space>
          </Card>
        </Col>

        {/* Table */}
        <Col xs={24} md={18}>
          <Card styles={{ body: { padding: 0 } }}>
            <Table
              dataSource={filteredRooms}
              columns={columns}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `${t} phòng`, pageSizeOptions: ['10', '20', '50', '100'] }}
              size="middle"
              scroll={{ x: 700 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Modal Form */}
      <Modal
        title={editId ? 'Sửa phòng' : 'Thêm phòng'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields() }}
        onOk={handleSubmit}
        confirmLoading={submitting}
        okButtonProps={{ disabled: submitting }}
        okText={editId ? 'Lưu' : 'Tạo'}
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="ma_phong" label="Mã phòng" rules={[{ required: true, message: 'Vui lòng nhập mã phòng' }]}>
            <Input placeholder="Nhập mã phòng" />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="toa_nha_id" label="Tòa" rules={[{ required: true, message: 'Chọn tòa' }]}>
                <Select placeholder="Chọn tòa" onChange={handleBuildChange} allowClear>
                  {builds.map((b) => (
                    <Select.Option key={b.id} value={b.id}>{b.ten_toa ?? b.ma_toa}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="tang_id" label="Tầng" rules={[{ required: true, message: 'Chọn tầng' }]}>
                <Select placeholder="Chọn tầng" allowClear>
                  {formFloors.map((f: any) => (
                    <Select.Option key={f.id} value={f.id}>Tầng {f.so_tang}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="so_giuong" label="Số giường">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="Nhập số giường" />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="loai_phong" label="Loại phòng">
                <Select placeholder="Chọn" allowClear>
                  <Select.Option value="HOC_VIEN">Học Viên</Select.Option>
                  <Select.Option value="CAN_BO">Cán Bộ</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="gioi_tinh_phong" label="Giới tính">
                <Select placeholder="Chọn" allowClear>
                  <Select.Option value="NAM">Nam</Select.Option>
                  <Select.Option value="NU">Nữ</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </PageContainer>
  )
}
