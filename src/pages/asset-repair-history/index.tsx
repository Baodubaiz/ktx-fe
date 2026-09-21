import { useEffect, useState } from 'react'
import {
  Table, Modal, Form, Input, InputNumber, Select, Button, Card, Tag,
  Space, Popconfirm, message, DatePicker, Row, Col, Statistic,
} from 'antd'
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
  ToolOutlined, CheckCircleOutlined, ClockCircleOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { PageHeader, PageContainer } from '@/components'
import { lichSuSuaChuaService, taiSanPhongService } from '@/services/asset.service'
import { roomService } from '@/services/room.service'
import { systemTheme } from '@/theme/system-theme'
import type {
  LichSuSuaChuaTaiSan,
  CreateLichSuSuaChuaDto,
  TaiSanPhong,
} from '@/types/asset'
import { RepairFilter } from './component/RepairFilter'
import type { RepairFilterValues } from './component/RepairFilter'

const { TextArea } = Input

export function AssetRepairHistoryTab() {
  const [data, setData] = useState<LichSuSuaChuaTaiSan[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState<LichSuSuaChuaTaiSan | null>(null)
  const [form] = Form.useForm()
  const [taiSans, setTaiSans] = useState<TaiSanPhong[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [filter, setFilter] = useState<RepairFilterValues>({})

  const fetchData = async () => {
    setLoading(true)
    try {
      const result = await lichSuSuaChuaService.getAll()
      setData(Array.isArray(result) ? result : [])
    } catch {
      message.error('Không thể tải dữ liệu lịch sử sửa chữa')
    } finally {
      setLoading(false)
    }
  }

  const fetchDropdowns = async () => {
    try {
      const [res, roomRes] = await Promise.all([
        taiSanPhongService.getAll(),
        roomService.getAll(),
      ])
      setTaiSans(Array.isArray(res) ? res : [])
      setRooms(Array.isArray(roomRes) ? roomRes : [])
    } catch {
      // silent
    }
  }

  useEffect(() => {
    fetchData()
    fetchDropdowns()
  }, [])

  const handleCreate = () => {
    setEditingRecord(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record: LichSuSuaChuaTaiSan) => {
    setEditingRecord(record)
    form.setFieldsValue({
      ...record,
      ngay_phat_hien: record.ngay_phat_hien ? dayjs(record.ngay_phat_hien) : null,
      ngay_sua: record.ngay_sua ? dayjs(record.ngay_sua) : null,
      chi_phi_sua: record.chi_phi_sua ? Number(record.chi_phi_sua) : null,
    })
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const dto: CreateLichSuSuaChuaDto = {
        ...values,
        ngay_phat_hien: values.ngay_phat_hien?.toISOString(),
        ngay_sua: values.ngay_sua?.toISOString(),
      }

      if (editingRecord) {
        await lichSuSuaChuaService.update(editingRecord.id, dto)
        message.success('Cập nhật thành công')
      } else {
        await lichSuSuaChuaService.create(dto)
        message.success('Tạo mới thành công')
      }
      setModalVisible(false)
      fetchData()
    } catch (error: any) {
      if (error?.errorFields) return
      const msg = error?.response?.data?.data?.message || error?.response?.data?.message || 'Thao tác thất bại'
      message.error(msg)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await lichSuSuaChuaService.delete(id)
      message.success('Xoá thành công')
      fetchData()
    } catch {
      message.error('Xoá thất bại')
    }
  }

  // Client-side filtering
  const filteredData = data.filter((record) => {
    if (filter.maPhong) {
      const phong = record.taiSanPhong?.phong?.ma_phong
      if (phong !== filter.maPhong) return false
    }
    if (filter.trangThai && record.trang_thai !== filter.trangThai) return false
    if (filter.ngayPhatHien?.[0] && filter.ngayPhatHien?.[1]) {
      const d = record.ngay_phat_hien ? new Date(record.ngay_phat_hien).getTime() : null
      if (!d || d < filter.ngayPhatHien[0].startOf('day').valueOf() || d > filter.ngayPhatHien[1].endOf('day').valueOf()) return false
    }
    if (filter.ngaySua?.[0] && filter.ngaySua?.[1]) {
      const d = record.ngay_sua ? new Date(record.ngay_sua).getTime() : null
      if (!d || d < filter.ngaySua[0].startOf('day').valueOf() || d > filter.ngaySua[1].endOf('day').valueOf()) return false
    }
    return true
  })

  // Statistics
  const totalRecords = filteredData.length
  const daSua = filteredData.filter((d) => d.trang_thai === 'DA_SUA').length
  const chuaSua = filteredData.filter((d) => d.trang_thai === 'CHUA_SUA').length

  const statCardStyle = {
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    borderRadius: 8,
    background: systemTheme.background.container,
    border: `1px solid ${systemTheme.border.subtle}`,
  }

  const columns: ColumnsType<LichSuSuaChuaTaiSan> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
      sorter: (a, b) => a.id - b.id,
      defaultSortOrder: 'descend',
    },
    {
      title: 'Tài sản phòng',
      render: (_, r) => r.taiSanPhong?.phong?.ma_phong ? `Phòng ${r.taiSanPhong.phong.ma_phong}` : `TS #${r.tai_san_phong_id || '-'}`,
      width: 150,
    },
    {
      title: 'Ngày phát hiện',
      dataIndex: 'ngay_phat_hien',
      render: (v) => v ? dayjs(v).format('DD/MM/YYYY') : '-',
      width: 130,
    },
    {
      title: 'SL hư',
      dataIndex: 'so_luong_hu',
      width: 80,
      render: (v) => v ?? '-',
    },
    {
      title: 'Mô tả hư hỏng',
      dataIndex: 'mo_ta_hu_hong',
      ellipsis: true,
      width: 200,
    },
    {
      title: 'Nguyên nhân',
      dataIndex: 'nguyen_nhan',
      ellipsis: true,
      width: 160,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trang_thai',
      width: 120,
      render: (v) => {
        if (v === 'DA_SUA') {
          return (
            <Tag
              icon={<CheckCircleOutlined />}
              style={{
                color: systemTheme.status.success,
                background: '#EEF8F2',
                borderColor: '#CBE9D6',
                fontWeight: 600,
              }}
            >
              Đã sửa
            </Tag>
          )
        }
        if (v === 'CHUA_SUA') {
          return (
            <Tag
              icon={<ClockCircleOutlined />}
              style={{
                color: systemTheme.status.warning,
                background: '#FFF7EA',
                borderColor: '#F2D6AA',
                fontWeight: 600,
              }}
            >
              Chưa sửa
            </Tag>
          )
        }
        return '-'
      },
    },
    {
      title: 'Ngày sửa',
      dataIndex: 'ngay_sua',
      render: (v) => v ? dayjs(v).format('DD/MM/YYYY') : '-',
      width: 120,
    },

    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="Xoá bản ghi này?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <>
      {/* Filter */}
      <RepairFilter
        taiSans={taiSans}
        rooms={rooms}
        values={filter}
        onChange={setFilter}
        onReset={() => setFilter({})}
      />

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={8}>
          <Card hoverable style={{ ...statCardStyle, borderTop: `3px solid ${systemTheme.status.info}` }}>
            <Statistic
              title="Tổng bản ghi"
              value={totalRecords}
              prefix={<ToolOutlined style={{ color: systemTheme.status.info }} />}
              valueStyle={{ color: systemTheme.status.info }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card hoverable style={{ ...statCardStyle, borderTop: `3px solid ${systemTheme.status.success}` }}>
            <Statistic
              title="Đã sửa"
              value={daSua}
              prefix={<CheckCircleOutlined style={{ color: systemTheme.status.success }} />}
              valueStyle={{ color: systemTheme.status.success }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card hoverable style={{ ...statCardStyle, borderTop: `3px solid ${systemTheme.status.warning}` }}>
            <Statistic
              title="Chưa sửa"
              value={chuaSua}
              prefix={<ClockCircleOutlined style={{ color: systemTheme.status.warning }} />}
              valueStyle={{ color: systemTheme.status.warning }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        style={{ borderColor: systemTheme.border.subtle }}
        styles={{ header: { background: systemTheme.background.subtle } }}
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>Làm mới</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>Thêm mới</Button>
          </Space>
        }
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          scroll={{ x: 1300 }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `Tổng ${t}`, pageSizeOptions: ['10', '20', '50', '100'] }}
        />
      </Card>

      {/* Modal Create/Edit */}
      <Modal
        title={editingRecord ? 'Cập nhật sửa chữa tài sản' : 'Thêm sửa chữa tài sản'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={640}
        okText={editingRecord ? 'Cập nhật' : 'Tạo mới'}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="tai_san_phong_id" label="Tài sản phòng" rules={[{ required: true, message: 'Chọn tài sản' }]}>
                <Select
                  showSearch
                  placeholder="Chọn tài sản phòng"
                  optionFilterProp="label"
                  options={taiSans.map((ts) => ({
                    label: `TS #${ts.id} - Phòng ${ts.phong?.ma_phong || ts.phong_id}`,
                    value: ts.id,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="so_luong_hu" label="Số lượng hư">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="ngay_phat_hien" label="Ngày phát hiện">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="trang_thai" label="Trạng thái">
                <Select allowClear placeholder="Chọn trạng thái">
                  <Select.Option value="CHUA_SUA">Chưa sửa</Select.Option>
                  <Select.Option value="DA_SUA">Đã sửa</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="ngay_sua" label="Ngày sửa">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12} style={{ display: 'none' }}>
              <Form.Item name="chi_phi_sua" label="Chi phí sửa (VNĐ)">
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(v) => v?.replace(/,/g, '') as any}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="mo_ta_hu_hong" label="Mô tả hư hỏng">
            <TextArea rows={2} placeholder="Mô tả chi tiết..." />
          </Form.Item>

          <Form.Item name="nguyen_nhan" label="Nguyên nhân">
            <TextArea rows={2} placeholder="Nguyên nhân hư hỏng..." />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default function AssetRepairHistoryPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Lịch sử sửa chữa tài sản"
        subtitle="Quản lý lịch sử sửa chữa, bảo trì tài sản ký túc xá"
      />
      <AssetRepairHistoryTab />
    </PageContainer>
  )
}
