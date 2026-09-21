import { useEffect, useState, useMemo } from 'react'
import {
  Tabs, Table, Modal, Form, Input, InputNumber, Select, Button, Card, Tag,
  Space, Popconfirm, message, Row, Col, Statistic, Descriptions, Badge, Progress,
} from 'antd'
import {
  EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined, ReloadOutlined,
  FilterOutlined, ClearOutlined, FileTextOutlined, CheckCircleOutlined,
  ClockCircleOutlined, DollarOutlined, WarningOutlined,
  SwapOutlined, ToolOutlined, AuditOutlined, HomeOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { PageHeader, PageContainer } from '@/components'
import { useAuth } from '@/hooks/useAuth'
import { RoomAssignmentHistoryTab } from '../room-assignment-history'
import { AssetRepairHistoryTab } from '../asset-repair-history'
import AuditLogsTab from '../systemLog/SystemLogsPage'
import { boiThuongService } from '@/services/asset.service'
import { baoCaoHuHongService } from '@/services/damage-report.service'
import type { QuanLyBoiThuongTaiSan } from '@/types/asset'
import type { BaoCaoHuHong } from '@/types/damage-report'

const { TextArea } = Input

/* ================================================================
   TAB BỒI THƯỜNG TÀI SẢN
   ================================================================ */
function TabBoiThuong() {
  const getTrangThai = (item: QuanLyBoiThuongTaiSan) =>
    item.ngay_boi_thuong ? 'DA_BOI_THUONG' : 'CHUA_NOP'

  const [data, setData] = useState<QuanLyBoiThuongTaiSan[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<QuanLyBoiThuongTaiSan | null>(null)
  const [filterHocVien, setFilterHocVien] = useState('')
  const [filterPhong, setFilterPhong] = useState('')
  const [filterTrangThai, setFilterTrangThai] = useState('ALL')

  const fetchData = async () => {
    setLoading(true)
    try { setData(await boiThuongService.getAll()) }
    catch { message.error('Lỗi tải dữ liệu bồi thường') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const filteredData = useMemo(() => data.filter(item => {
    if (filterHocVien && !(item.hocVien?.ho_ten ?? '').toLowerCase().includes(filterHocVien.toLowerCase())) return false
    if (filterPhong && !(item.taiSan?.taiSanPhong?.phong?.ma_phong ?? '').toLowerCase().includes(filterPhong.toLowerCase())) return false
    if (filterTrangThai !== 'ALL' && getTrangThai(item) !== filterTrangThai) return false
    return true
  }), [data, filterHocVien, filterPhong, filterTrangThai])

  const total = data.length
  const paid = data.filter(d => getTrangThai(d) === 'DA_BOI_THUONG').length
  const pending = total - paid
  const totalAmount = data.reduce((sum, item) => sum + (item.so_tien || 0), 0)
  const paidPercent = total > 0 ? Math.round((paid / total) * 100) : 0
  const activeFilterCount = [filterHocVien, filterPhong, filterTrangThai !== 'ALL' ? filterTrangThai : ''].filter(Boolean).length

  const columns: ColumnsType<QuanLyBoiThuongTaiSan> = [
    { title: 'STT', width: 60, align: 'center', render: (_, __, i) => i + 1 },
    { title: 'Học viên', align: 'center', render: (_, r) => r.hocVien?.ho_ten ?? `ID: ${r.hoc_vien_id}` },
    { title: 'Phòng', align: 'center', render: (_, r) => r.taiSan?.taiSanPhong?.phong?.ma_phong ?? '—' },
    { title: 'Tài sản', align: 'center', ellipsis: true, render: (_, r) => r.taiSan?.mo_ta_hu_hong ?? r.taiSan?.taiSanPhong?.ghi_chu ?? `ID: ${r.tai_san_hu_hong}` },
    { title: 'Số tiền', align: 'center', render: (_, r) => `${r.so_tien?.toLocaleString('vi-VN')} đ` },
    {
      title: 'Trạng thái', align: 'center',
      render: (_, r) => <Tag color={getTrangThai(r) === 'DA_BOI_THUONG' ? 'green' : 'red'}>
        {getTrangThai(r) === 'DA_BOI_THUONG' ? 'Đã bồi thường' : 'Chưa nộp'}
      </Tag>,
    },
    {
      title: 'Thao tác', align: 'center', width: 80, fixed: 'right',
      render: (_, r) => <Button size="small" icon={<EyeOutlined />} onClick={() => { setEditItem(r); setModalOpen(true) }} />,
    },
  ]

  return (
    <div>
      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6}>
          <Card hoverable style={{ borderTop: '3px solid #1890ff' }}>
            <Statistic title="Tổng bồi thường" value={total} prefix={<FileTextOutlined style={{ color: '#1890ff' }} />} valueStyle={{ color: '#1890ff', fontWeight: 700 }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card hoverable style={{ borderTop: '3px solid #52c41a' }}>
            <Statistic title="Đã nộp" value={paid} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} valueStyle={{ color: '#52c41a', fontWeight: 700 }} />
            <Progress percent={paidPercent} strokeColor="#52c41a" showInfo size="small" style={{ marginTop: 8 }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card hoverable style={{ borderTop: '3px solid #ff4d4f' }}>
            <Statistic title="Chưa nộp" value={pending} prefix={<ClockCircleOutlined style={{ color: '#ff4d4f' }} />} valueStyle={{ color: '#ff4d4f', fontWeight: 700 }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card hoverable style={{ borderTop: '3px solid #faad14' }}>
            <Statistic title="Tổng số tiền" value={totalAmount} prefix={<DollarOutlined style={{ color: '#faad14' }} />} valueStyle={{ color: '#faad14', fontWeight: 700 }} suffix="đ" />
          </Card>
        </Col>
      </Row>

      <div style={{ display: 'flex', gap: 16 }}>
        {/* Filter sidebar */}
        <Card
          title={
            <Space>
              <FilterOutlined /><span>Bộ lọc</span>
              {activeFilterCount > 0 && <Badge count={activeFilterCount} style={{ backgroundColor: '#52c41a' }} />}
            </Space>
          }
          style={{ width: 260, flexShrink: 0 }} size="small"
        >
          <Space direction="vertical" style={{ width: '100%' }} size={10}>
            <div>
              <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>Học viên</div>
              <Input placeholder="Tìm theo tên..." allowClear value={filterHocVien} onChange={e => setFilterHocVien(e.target.value)} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>Phòng</div>
              <Input placeholder="Tìm theo phòng..." allowClear value={filterPhong} onChange={e => setFilterPhong(e.target.value)} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>Trạng thái</div>
              <Select style={{ width: '100%' }} value={filterTrangThai} onChange={setFilterTrangThai}
                options={[{ value: 'ALL', label: 'Tất cả' }, { value: 'CHUA_NOP', label: 'Chưa nộp' }, { value: 'DA_BOI_THUONG', label: 'Đã bồi thường' }]} />
            </div>
            <Button block icon={<ClearOutlined />} onClick={() => { setFilterHocVien(''); setFilterPhong(''); setFilterTrangThai('ALL') }}>Đặt lại</Button>
          </Space>
        </Card>

        {/* Table */}
        <div style={{ flex: 1 }}>
          <Card
            title="Danh sách bồi thường tài sản"
            extra={<Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>Làm mới</Button>}
            styles={{ header: { background: 'linear-gradient(to right, #fafafa, #ffffff)', borderBottom: '2px solid #f0f0f0' }, body: { padding: 0 } }}
          >
            <Table size="middle" rowKey="id" loading={loading} dataSource={filteredData} columns={columns}
              locale={{ emptyText: 'Không có dữ liệu' }}
              pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `${t} bồi thường`, pageSizeOptions: ['10', '20', '50', '100'] }}
              scroll={{ x: 'max-content' }}
            />
          </Card>

          <Modal title="Chi tiết bồi thường" open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={600}>
            {editItem && (
              <Descriptions column={1} size="small" bordered style={{ marginTop: 16 }}>
                <Descriptions.Item label="Học viên">{editItem.hocVien?.ho_ten ?? `ID: ${editItem.hoc_vien_id}`}</Descriptions.Item>
                <Descriptions.Item label="Phòng">{editItem.taiSan?.taiSanPhong?.phong?.ma_phong ?? '—'}</Descriptions.Item>
                <Descriptions.Item label="Tài sản">{editItem.taiSan?.mo_ta_hu_hong ?? '—'}</Descriptions.Item>
                <Descriptions.Item label="Số tiền">{editItem.so_tien?.toLocaleString('vi-VN')} đ</Descriptions.Item>
                <Descriptions.Item label="Ngày bồi thường">
                  {editItem.ngay_boi_thuong ? new Date(editItem.ngay_boi_thuong).toLocaleDateString('vi-VN') : 'Chưa bồi thường'}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={getTrangThai(editItem) === 'DA_BOI_THUONG' ? 'green' : 'red'}>
                    {getTrangThai(editItem) === 'DA_BOI_THUONG' ? 'Đã bồi thường' : 'Chưa nộp'}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            )}
          </Modal>
        </div>
      </div>
    </div>
  )
}

/* ================================================================
   TAB BÁO CÁO HƯ HỎNG
   ================================================================ */
function TabBaoCaoHuHong() {
  const [data, setData] = useState<BaoCaoHuHong[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editItem, setEditItem] = useState<BaoCaoHuHong | null>(null)
  const [form] = Form.useForm()
  const [filterPhong, setFilterPhong] = useState('')
  const [filterTrungDoi, setFilterTrungDoi] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try { setData(await baoCaoHuHongService.getAll()) }
    catch { message.error('Lỗi tải dữ liệu báo cáo') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const openCreate = () => { setEditItem(null); form.resetFields(); setModalOpen(true) }

  const openEdit = (item: BaoCaoHuHong) => {
    setEditItem(item)
    form.setFieldsValue({
      phong_id: item.phong_id,
      trung_doi_id: item.trung_doi_id,
      noi_dung: item.noi_dung ?? '',
      ngay_bao: item.ngay_bao?.slice(0, 10),
      so_lan_bao: item.so_lan_bao,
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    setSubmitting(true)
    try {
      if (editItem) await baoCaoHuHongService.update(editItem.id, values)
      else await baoCaoHuHongService.create(values)
      message.success(editItem ? 'Cập nhật thành công' : 'Thêm thành công')
      setModalOpen(false); form.resetFields(); fetchData()
    } catch { message.error('Thao tác thất bại') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (id: number) => {
    try { await baoCaoHuHongService.delete(id); message.success('Đã xóa'); fetchData() }
    catch { message.error('Xóa thất bại') }
  }

  const filteredData = useMemo(() => data.filter(item => {
    if (filterPhong && !(item.phong?.ma_phong ?? '').toLowerCase().includes(filterPhong.toLowerCase())) return false
    if (filterTrungDoi && !(item.trungDoi?.ten_don_vi ?? '').toLowerCase().includes(filterTrungDoi.toLowerCase())) return false
    return true
  }), [data, filterPhong, filterTrungDoi])

  const total = data.length
  const maxReports = data.length > 0 ? Math.max(...data.map(d => d.so_lan_bao || 0)) : 0
  const uniqueRooms = new Set(data.map(d => d.phong_id)).size
  const uniqueSquads = new Set(data.map(d => d.trung_doi_id).filter(Boolean)).size
  const activeFilterCount = [filterPhong, filterTrungDoi].filter(Boolean).length

  const columns: ColumnsType<BaoCaoHuHong> = [
    { title: 'STT', width: 60, align: 'center', render: (_, __, i) => i + 1 },
    { title: 'Phòng', align: 'center', render: (_, r) => r.phong?.ma_phong ?? `ID: ${r.phong_id}` },
    { title: 'Trung đội', align: 'center', render: (_, r) => r.trungDoi?.ten_don_vi ?? (r.trung_doi_id ? `ID: ${r.trung_doi_id}` : '—') },
    { title: 'Nội dung', dataIndex: 'noi_dung', align: 'center', ellipsis: true },
    { title: 'Ngày báo', align: 'center', render: (_, r) => r.ngay_bao ? new Date(r.ngay_bao).toLocaleDateString('vi-VN') : '' },
    { title: 'Số lần báo', dataIndex: 'so_lan_bao', align: 'center', width: 100 },
    {
      title: 'Thao tác', align: 'center', width: 100, fixed: 'right',
      render: (_, r) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} type="primary" />
          <Popconfirm title="Xác nhận xóa?" onConfirm={() => handleDelete(r.id)} okButtonProps={{ danger: true }}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6}>
          <Card hoverable style={{ borderTop: '3px solid #1890ff' }}>
            <Statistic title="Tổng báo cáo" value={total} prefix={<WarningOutlined style={{ color: '#1890ff' }} />} valueStyle={{ color: '#1890ff', fontWeight: 700 }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card hoverable style={{ borderTop: '3px solid #ff4d4f' }}>
            <Statistic title="Số lần báo cao nhất" value={maxReports} prefix={<FileTextOutlined style={{ color: '#ff4d4f' }} />} valueStyle={{ color: '#ff4d4f', fontWeight: 700 }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card hoverable style={{ borderTop: '3px solid #722ed1' }}>
            <Statistic title="Số phòng báo hư" value={uniqueRooms} prefix={<HomeOutlined style={{ color: '#722ed1' }} />} valueStyle={{ color: '#722ed1', fontWeight: 700 }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card hoverable style={{ borderTop: '3px solid #13c2c2' }}>
            <Statistic title="Số trung đội" value={uniqueSquads} prefix={<FileTextOutlined style={{ color: '#13c2c2' }} />} valueStyle={{ color: '#13c2c2', fontWeight: 700 }} />
          </Card>
        </Col>
      </Row>

      <div style={{ display: 'flex', gap: 16 }}>
        {/* Filter sidebar */}
        <Card
          title={
            <Space>
              <FilterOutlined /><span>Bộ lọc</span>
              {activeFilterCount > 0 && <Badge count={activeFilterCount} style={{ backgroundColor: '#52c41a' }} />}
            </Space>
          }
          style={{ width: 260, flexShrink: 0 }} size="small"
        >
          <Space direction="vertical" style={{ width: '100%' }} size={10}>
            <div>
              <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>Phòng</div>
              <Input placeholder="Tìm theo phòng..." allowClear value={filterPhong} onChange={e => setFilterPhong(e.target.value)} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>Trung đội</div>
              <Input placeholder="Tìm trung đội..." allowClear value={filterTrungDoi} onChange={e => setFilterTrungDoi(e.target.value)} />
            </div>
            <Button block icon={<ClearOutlined />} onClick={() => { setFilterPhong(''); setFilterTrungDoi('') }}>Đặt lại</Button>
          </Space>
        </Card>

        {/* Table */}
        <div style={{ flex: 1 }}>
          <Card
            title="Danh sách báo cáo hư hỏng"
            extra={
              <Space>
                <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm mới</Button>
                <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>Làm mới</Button>
              </Space>
            }
            styles={{ header: { background: 'linear-gradient(to right, #fafafa, #ffffff)', borderBottom: '2px solid #f0f0f0' }, body: { padding: 0 } }}
          >
            <Table size="middle" rowKey="id" loading={loading} dataSource={filteredData} columns={columns}
              locale={{ emptyText: 'Không có dữ liệu' }}
              pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `${t} báo cáo`, pageSizeOptions: ['10', '20', '50', '100'] }}
              scroll={{ x: 'max-content' }}
            />
          </Card>

          <Modal
            title={editItem ? 'Cập nhật báo cáo hư hỏng' : 'Thêm báo cáo hư hỏng'}
            open={modalOpen} width={640}
            onCancel={() => { setModalOpen(false); form.resetFields() }}
            onOk={handleSubmit} confirmLoading={submitting}
            okText={editItem ? 'Cập nhật' : 'Thêm'} cancelText="Hủy" destroyOnClose
          >
            <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
              <Form.Item name="phong_id" label="Phòng" rules={[{ required: true, message: 'Nhập ID phòng' }]}>
                <InputNumber size="large" style={{ width: '100%' }} placeholder="ID phòng" />
              </Form.Item>
              <Form.Item name="trung_doi_id" label="Trung đội">
                <InputNumber size="large" style={{ width: '100%' }} placeholder="ID trung đội" />
              </Form.Item>
              <Form.Item name="noi_dung" label="Nội dung">
                <TextArea rows={3} placeholder="Mô tả chi tiết nội dung báo cáo..." />
              </Form.Item>
              <Form.Item name="ngay_bao" label="Ngày báo">
                <Input type="date" size="large" />
              </Form.Item>
              <Form.Item name="so_lan_bao" label="Số lần báo" initialValue={1}>
                <InputNumber size="large" style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </div>
    </div>
  )
}

/* ================================================================
   MASTER PAGE
   ================================================================ */
export default function NhatKyHeThongPage() {
  const { user } = useAuth()
  // Backend returns role as a flat string e.g. 'ADMIN', not { name: 'ADMIN' }
  const userRole = (user as any)?.role
  const isAdmin = userRole === 'ADMIN' || userRole?.name === 'ADMIN' || user?.level === 1

  const tabItems = useMemo(() => [
    {
      key: 'bo-tri-phong',
      label: <span><SwapOutlined /> Bố trí phòng</span>,
      children: <RoomAssignmentHistoryTab />,
    },
    {
      key: 'sua-chua-ts',
      label: <span><ToolOutlined /> Sửa chữa tài sản</span>,
      children: <AssetRepairHistoryTab />,
    },
    {
      key: 'boi-thuong',
      label: <span><DollarOutlined /> Bồi thường tài sản</span>,
      children: <TabBoiThuong />,
    },
    {
      key: 'bao-cao-hu-hong',
      label: <span><WarningOutlined /> Báo cáo hư hỏng</span>,
      children: <TabBaoCaoHuHong />,
    },
    ...(isAdmin ? [{
      key: 'audit-log',
      label: <span><AuditOutlined /> Audit log hệ thống</span>,
      children: <AuditLogsTab />,
    }] : []),
  ], [isAdmin])

  return (
    <PageContainer>
      <PageHeader
        title="Nhật ký hệ thống"
        subtitle="Theo dõi toàn bộ lịch sử hoạt động trong hệ thống"
        breadcrumbs={[{ label: 'Nhật ký hệ thống' }]}
      />
      <Tabs
        items={tabItems}
        size="large"
        style={{
          background: '#fff',
          padding: '0 24px 24px',
          borderRadius: 8,
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        }}
        tabBarStyle={{ marginBottom: 24 }}
      />
    </PageContainer>
  )
}
