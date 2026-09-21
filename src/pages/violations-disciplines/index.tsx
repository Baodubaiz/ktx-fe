import { useEffect, useState } from 'react'
import {
  Tabs, Table, Modal, Form, Input, Select, Button, Card, Tag, Space,
  Popconfirm, message, Row, Col, Statistic, Progress, Badge,
  DatePicker
} from 'antd'
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
  WarningOutlined, CheckCircleOutlined, ClockCircleOutlined,
  FileTextOutlined, AlertOutlined, SafetyOutlined,
  FilterOutlined, ClearOutlined, DownloadOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useLocation } from 'react-router-dom'
import dayjs from 'dayjs'
import { PageHeader, PageContainer, ReportExportModal } from '@/components'
import type { ReportGroup, ReportModalFilters } from '@/components'
import { viPhamService, kyLuatService } from '@/services/violation.service'
import { studentService } from '@/services/student.service'
import { reportService } from '@/services/report.service'
import { api } from '@/lib/axios'
import type {
  ViPham, CreateViPhamDto,
  KyLuat, CreateKyLuatDto,
  HinhThucKyLuat,
} from '@/types/violation'
import type { Student } from '@/types/student'
import './violations-disciplines.css'

const { TextArea } = Input
const { RangePicker } = DatePicker

const unwrapLookup = (res: any) => {
  const d = res.data?.data ?? res.data
  return d?.data ?? d
}

/* ===== STATISTICS COMPONENT ===== */
function ViolationStatistics({ violations }: { violations: ViPham[] }) {
  const total = violations.length
  const processed = violations.filter(v => v.trang_thai === 'DA_XU_LY').length
  const pending = total - processed
  const thisMonth = violations.filter(v => {
    if (!v.ngay_vi_pham) return false
    return dayjs(v.ngay_vi_pham).isSame(dayjs(), 'month')
  }).length

  const processedPercent = total > 0 ? Math.round((processed / total) * 100) : 0
  const thisMonthPercent = total > 0 ? Math.round((thisMonth / total) * 100) : 0

  return (
    <div style={{ marginBottom: 20 }} className="animate-fade-in">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderTop: '3px solid #1890ff' }}>
            <Statistic
              title="Tổng vi phạm"
              value={total}
              prefix={<WarningOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderTop: '3px solid #52c41a' }}>
            <Statistic
              title="Đã xử lý"
              value={processed}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontWeight: 700 }}
            />
            <Progress percent={processedPercent} strokeColor="#52c41a" showInfo size="small" style={{ marginTop: 8 }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderTop: '3px solid #ff4d4f' }}>
            <Statistic
              title="Chưa xử lý"
              value={pending}
              prefix={<ClockCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderTop: '3px solid #fa8c16' }}>
            <Statistic
              title="VI phạm tháng này"
              value={thisMonth}
              prefix={<FileTextOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16', fontWeight: 700 }}
            />
            <Progress percent={thisMonthPercent} strokeColor="#fa8c16" showInfo size="small" style={{ marginTop: 8 }} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

function DisciplineStatistics({ disciplines }: { disciplines: KyLuat[] }) {
  const total = disciplines.length
  const byLevel = disciplines.reduce((acc, d) => {
    const level = d.hinhThucKyLuat?.muc_do ?? 'Khác'
    acc[level] = (acc[level] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topLevel = Object.entries(byLevel).sort((a, b) => b[1] - a[1])[0]

  const thisMonth = disciplines.filter(d => {
    if (!d.ngay_quyet_dinh) return false
    return dayjs(d.ngay_quyet_dinh).isSame(dayjs(), 'month')
  }).length
  const thisMonthPercent = total > 0 ? Math.round((thisMonth / total) * 100) : 0

  return (
    <div style={{ marginBottom: 20 }} className="animate-fade-in">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderTop: '3px solid #722ed1' }}>
            <Statistic
              title="Tổng kỷ luật"
              value={total}
              prefix={<AlertOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderTop: '3px solid #eb2f96' }}>
            <Statistic
              title="Mức độ cao nhất"
              value={topLevel?.[1] ?? 0}
              prefix={<SafetyOutlined style={{ color: '#eb2f96' }} />}
              valueStyle={{ color: '#eb2f96', fontWeight: 700 }}
            />
            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 8 }}>
              {topLevel?.[0] ?? 'Chưa có dữ liệu'}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderTop: '3px solid #13c2c2' }}>
            <Statistic
              title="Kỷ luật tháng này"
              value={thisMonth}
              prefix={<FileTextOutlined style={{ color: '#13c2c2' }} />}
              valueStyle={{ color: '#13c2c2', fontWeight: 700 }}
            />
            <Progress percent={thisMonthPercent} strokeColor="#13c2c2" showInfo size="small" style={{ marginTop: 8 }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderTop: '3px solid #faad14' }}>
            <Statistic
              title="Số loại kỷ luật"
              value={Object.keys(byLevel).length}
              prefix={<FileTextOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14', fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

/* ================================================================
   TAB 1 – VI PHẠM
   ================================================================ */
function TabViPham() {
  const location = useLocation()
  const [data, setData] = useState<ViPham[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editItem, setEditItem] = useState<ViPham | null>(null)
  const [filterSearch, setFilterSearch] = useState('')
  const [filterTrangThai, setFilterTrangThai] = useState('ALL')
  const [filterNgayTu, setFilterNgayTu] = useState('')
  const [filterNgayDen, setFilterNgayDen] = useState('')
  const [form] = Form.useForm()

  // Lookup data
  const [studentList, setStudentList] = useState<Student[]>([])
  const [userList, setUserList] = useState<any[]>([])

  const fetchData = async () => {
    setLoading(true)
    try { setData(await viPhamService.getAll()) }
    catch { message.error('Lỗi tải dữ liệu vi phạm') }
    finally { setLoading(false) }
  }

  const fetchLookups = async () => {
    try {
      const [students, usersRes] = await Promise.all([
        studentService.getAll(),
        api.get('/nguoi-dung'),
      ])
      setStudentList(Array.isArray(students) ? students : [])
      const users = unwrapLookup(usersRes)
      setUserList(Array.isArray(users) ? users : [])
    } catch { /* lookup optional */ }
  }

  useEffect(() => { fetchData(); fetchLookups() }, [])

  const openCreate = () => { setEditItem(null); form.resetFields(); setModalOpen(true) }

  useEffect(() => {
    if (location.state?.openAdd) {
      openCreate()
      window.history.replaceState({}, '')
    }
  }, [location.state])

  const openEdit = (item: ViPham) => {
    setEditItem(item)
    form.setFieldsValue({
      hoc_vien_id: item.hoc_vien_id, noi_dung: item.noi_dung ?? '',
      ngay_vi_pham: item.ngay_vi_pham?.slice(0, 10), hinh_thuc: item.hinh_thuc ?? '',
      nguoi_lap: item.nguoi_lap, trang_thai: item.trang_thai, ghi_chu: item.ghi_chu ?? '',
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields() as CreateViPhamDto
    setSubmitting(true)
    try {
      if (editItem) await viPhamService.update(editItem.id, values)
      else await viPhamService.create(values)
      message.success(editItem ? 'Cập nhật thành công' : 'Thêm thành công')
      setModalOpen(false); form.resetFields(); fetchData()
    } catch { message.error('Thao tác thất bại') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (id: number) => {
    try { await viPhamService.delete(id); message.success('Đã xóa'); fetchData() }
    catch { message.error('Xóa thất bại') }
  }

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates[0] && dates[1]) {
      setFilterNgayTu(dates[0].format('YYYY-MM-DD'))
      setFilterNgayDen(dates[1].format('YYYY-MM-DD'))
    } else {
      setFilterNgayTu('')
      setFilterNgayDen('')
    }
  }

  const filteredData = data.filter((item) => {
    const matchTrangThai = filterTrangThai === 'ALL' || item.trang_thai === filterTrangThai
    const matchSearch = !filterSearch ||
      item.hocVien?.ho_ten?.toLowerCase().includes(filterSearch.toLowerCase()) ||
      item.noi_dung?.toLowerCase().includes(filterSearch.toLowerCase())
    if (filterNgayTu && item.ngay_vi_pham && item.ngay_vi_pham < filterNgayTu) return false
    if (filterNgayDen && item.ngay_vi_pham && item.ngay_vi_pham > filterNgayDen + 'T23:59:59') return false
    return matchTrangThai && matchSearch
  })

  const activeFilterCount = [filterSearch, filterTrangThai !== 'ALL' ? filterTrangThai : '', filterNgayTu, filterNgayDen].filter(Boolean).length

  const columns: ColumnsType<ViPham> = [
    {
      title: 'STT', width: 60, align: 'center', render: (_, __, i) => (
        <span style={{ fontWeight: 600, color: '#8c8c8c', fontSize: 12 }}>{i + 1}</span>
      )
    },
    {
      title: 'Học viên', align: 'center', render: (_, r) => (
        <span style={{ fontWeight: 600, color: '#262626' }}>
          {r.hocVien?.ho_ten ?? `ID: ${r.hoc_vien_id}`}
        </span>
      )
    },
    { title: 'Nội dung', dataIndex: 'noi_dung', align: 'center', ellipsis: true },
    {
      title: 'Ngày vi phạm', align: 'center', render: (_, r) => (
        <span style={{ fontSize: 13, color: '#595959' }}>
          {r.ngay_vi_pham ? new Date(r.ngay_vi_pham).toLocaleDateString('vi-VN') : ''}
        </span>
      )
    },
    { title: 'Hình thức', dataIndex: 'hinh_thuc', align: 'center', render: (v) => v ? <Tag color="orange">{v}</Tag> : '-' },
    {
      title: 'Trạng thái', align: 'center', render: (_, r) => (
        <Tag color={r.trang_thai === 'DA_XU_LY' ? 'green' : 'red'} icon={r.trang_thai === 'DA_XU_LY' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}>
          {r.trang_thai === 'DA_XU_LY' ? 'Đã xử lý' : 'Chưa xử lý'}
        </Tag>
      )
    },
    {
      title: 'Thao tác', align: 'center', width: 120, fixed: 'right',
      render: (_, r) => (
        <Space>
          <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          <Popconfirm title="Xác nhận xóa vi phạm này?" description="Hành động này không thể hoàn tác."
            onConfirm={() => handleDelete(r.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <ViolationStatistics violations={data} />

      <div style={{ display: 'flex', gap: 16 }}>
        <Card
          title={
            <Space>
              <FilterOutlined />
              <span>Bộ lọc</span>
              {activeFilterCount > 0 && <Badge count={activeFilterCount} style={{ backgroundColor: '#52c41a' }} />}
            </Space>
          }
          style={{ width: 280, flexShrink: 0, borderRadius: 8 }} size="small">
          <Space direction="vertical" style={{ width: '100%' }} size={12}>
            <div>
              <div style={{ fontSize: 11, marginBottom: 4, color: '#595959', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Tìm kiếm</div>
              <Input placeholder="Tên học viên, nội dung..." allowClear value={filterSearch} onChange={e => setFilterSearch(e.target.value)} />
            </div>
            <div>
              <div style={{ fontSize: 11, marginBottom: 4, color: '#595959', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Thời gian</div>
              <RangePicker
                style={{ width: '100%' }}
                placeholder={['Từ ngày', 'Đến ngày']}
                format="DD/MM/YYYY"
                onChange={handleDateRangeChange}
                value={filterNgayTu && filterNgayDen ? [dayjs(filterNgayTu), dayjs(filterNgayDen)] : null}
              />
            </div>
            <div>
              <div style={{ fontSize: 11, marginBottom: 4, color: '#595959', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Trạng thái</div>
              <Select style={{ width: '100%' }} value={filterTrangThai} onChange={setFilterTrangThai}
                options={[
                  { value: 'ALL', label: 'Tất cả' },
                  { value: 'CHUA_XU_LY', label: 'Chưa xử lý' },
                  { value: 'DA_XU_LY', label: 'Đã xử lý' }
                ]} />
            </div>
            <Button block icon={<ClearOutlined />} onClick={() => { setFilterSearch(''); setFilterTrangThai('ALL'); setFilterNgayTu(''); setFilterNgayDen('') }}>Đặt lại</Button>
          </Space>
        </Card>

        <div style={{ flex: 1 }}>
          <Card
            title={<span>Danh sách vi phạm</span>}
            extra={
              <Space>
                <Button type="primary" style={{ background: 'linear-gradient(135deg, #3e57c4db 0%, #2b1eb5c5 100%)', border: 'none', boxShadow: '0 2px 8px rgba(102, 126, 234, 0.4)' }} icon={<PlusOutlined />} onClick={openCreate}>Thêm mới</Button>
                <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>Làm mới</Button>
              </Space>
            }
            styles={{
              header: { background: 'linear-gradient(to right, #fafafa, #ffffff)', borderBottom: '2px solid #f0f0f0' },
              body: { padding: 0 }
            }}
            style={{ borderRadius: 8 }}
          >
            <Table size="middle" rowKey="id" loading={loading} dataSource={filteredData} columns={columns}
              locale={{ emptyText: 'Không có dữ liệu' }}
              pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t: number) => `${t} vi phạm`, pageSizeOptions: ['10', '20', '50', '100'] }}
              scroll={{ x: 'max-content' }}
            />
          </Card>

          <Modal title={`${editItem ? 'Cập nhật' : 'Thêm'} vi phạm`} open={modalOpen} width={640}
            onCancel={() => setModalOpen(false)} onOk={handleSubmit} confirmLoading={submitting}
            okButtonProps={{ disabled: submitting }}
            okText={editItem ? 'Cập nhật' : 'Thêm'} cancelText="Hủy">
            <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
              <Form.Item name="hoc_vien_id" label="Học viên" rules={[{ required: true, message: 'Chọn học viên' }]}>
                <Select showSearch placeholder="Tìm và chọn học viên..." optionFilterProp="label" size="large"
                  options={studentList.map(s => ({ value: s.id, label: `${s.ma_hoc_vien} – ${s.ho_ten ?? 'Chưa có tên'}` }))}
                />
              </Form.Item>
              <Form.Item name="noi_dung" label="Nội dung"><TextArea rows={3} /></Form.Item>
              <Form.Item name="ngay_vi_pham" label="Ngày vi phạm"><Input type="date" size="large" /></Form.Item>
              <Form.Item name="hinh_thuc" label="Hình thức"><Input size="large" /></Form.Item>
              <Form.Item name="nguoi_lap" label="Người lập">
                <Select showSearch allowClear placeholder="Chọn người lập..." optionFilterProp="label" size="large"
                  options={userList.map((u: any) => ({ value: u.id, label: u.hoTen ?? u.username ?? `User #${u.id}` }))}
                />
              </Form.Item>
              <Form.Item name="trang_thai" label="Trạng thái" initialValue="CHUA_XU_LY">
                <Select size="large" options={[{ value: 'CHUA_XU_LY', label: 'Chưa xử lý' }, { value: 'DA_XU_LY', label: 'Đã xử lý' }]} />
              </Form.Item>
              <Form.Item name="ghi_chu" label="Ghi chú"><TextArea rows={2} /></Form.Item>
            </Form>
          </Modal>
        </div>
      </div>
    </div>
  )
}

/* ================================================================
   TAB 2 – KỶ LUẬT
   ================================================================ */
function TabKyLuat() {
  const [data, setData] = useState<KyLuat[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editItem, setEditItem] = useState<KyLuat | null>(null)
  const [filterHinhThuc, setFilterHinhThuc] = useState('ALL')
  const [filterSoQD, setFilterSoQD] = useState('')
  const [filterNgayTu, setFilterNgayTu] = useState('')
  const [filterNgayDen, setFilterNgayDen] = useState('')
  const [form] = Form.useForm()

  const [viPhamList, setViPhamList] = useState<ViPham[]>([])
  const [hinhThucKLList, setHinhThucKLList] = useState<HinhThucKyLuat[]>([])

  const fetchData = async () => {
    setLoading(true)
    try { setData(await kyLuatService.getAll()) }
    catch { message.error('Lỗi tải dữ liệu kỷ luật') }
    finally { setLoading(false) }
  }

  const fetchLookups = async () => {
    try {
      const [viPhams, hinhThucRes] = await Promise.all([
        viPhamService.getAll(),
        api.get('/hinh-thuc-ky-luat'),
      ])
      setViPhamList(Array.isArray(viPhams) ? viPhams : [])
      const htList = unwrapLookup(hinhThucRes)
      setHinhThucKLList(Array.isArray(htList) ? htList : [])
    } catch { /* */ }
  }

  useEffect(() => { fetchData(); fetchLookups() }, [])

  const openCreate = () => { setEditItem(null); form.resetFields(); setModalOpen(true) }
  const openEdit = (item: KyLuat) => {
    setEditItem(item)
    form.setFieldsValue({
      hinh_thuc: item.hinh_thuc, vi_pham_id: item.vi_pham_id,
      so_quyet_dinh: item.so_quyet_dinh ?? '', ngay_quyet_dinh: item.ngay_quyet_dinh?.slice(0, 10),
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields() as CreateKyLuatDto
    setSubmitting(true)
    try {
      if (editItem) await kyLuatService.update(editItem.id, values)
      else await kyLuatService.create(values)
      message.success(editItem ? 'Cập nhật thành công' : 'Thêm thành công')
      setModalOpen(false); form.resetFields(); fetchData()
    } catch { message.error('Thao tác thất bại') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (id: number) => {
    try { await kyLuatService.delete(id); message.success('Đã xóa'); fetchData() }
    catch { message.error('Xóa thất bại') }
  }

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates[0] && dates[1]) {
      setFilterNgayTu(dates[0].format('YYYY-MM-DD'))
      setFilterNgayDen(dates[1].format('YYYY-MM-DD'))
    } else {
      setFilterNgayTu('')
      setFilterNgayDen('')
    }
  }

  const filteredData = data.filter((item) => {
    if (filterSoQD && !(item.so_quyet_dinh ?? '').toLowerCase().includes(filterSoQD.toLowerCase())) return false
    if (filterHinhThuc !== 'ALL' && (item.hinhThucKyLuat?.ten_hinh_thuc_ky_luat ?? '') !== filterHinhThuc) return false
    if (filterNgayTu && item.ngay_quyet_dinh && item.ngay_quyet_dinh < filterNgayTu) return false
    if (filterNgayDen && item.ngay_quyet_dinh && item.ngay_quyet_dinh > filterNgayDen + 'T23:59:59') return false
    return true
  })

  const activeFilterCount = [filterSoQD, filterHinhThuc !== 'ALL' ? filterHinhThuc : '', filterNgayTu, filterNgayDen].filter(Boolean).length

  const columns: ColumnsType<KyLuat> = [
    {
      title: 'STT', width: 60, align: 'center', render: (_, __, i) => (
        <span style={{ fontWeight: 600, color: '#8c8c8c', fontSize: 12 }}>{i + 1}</span>
      )
    },
    {
      title: 'Học viên', align: 'center', render: (_, r) => (
        <span style={{ fontWeight: 600, color: '#262626' }}>
          {r.viPham?.hocVien?.ho_ten ?? `VP ID: ${r.vi_pham_id}`}
        </span>
      )
    },
    {
      title: 'Hình thức kỷ luật', align: 'center', render: (_, r) => (
        <Tag color="purple">{r.hinhThucKyLuat?.ten_hinh_thuc_ky_luat ?? `ID: ${r.hinh_thuc}`}</Tag>
      )
    },
    {
      title: 'Mức độ', align: 'center', render: (_, r) => (
        <Tag color="orange">{r.hinhThucKyLuat?.muc_do ?? '—'}</Tag>
      )
    },
    { title: 'Số quyết định', dataIndex: 'so_quyet_dinh', align: 'center', render: (v) => v || '-' },
    {
      title: 'Ngày quyết định', align: 'center', render: (_, r) => (
        <span style={{ fontSize: 13, color: '#595959' }}>
          {r.ngay_quyet_dinh ? new Date(r.ngay_quyet_dinh).toLocaleDateString('vi-VN') : ''}
        </span>
      )
    },
    {
      title: 'Thao tác', align: 'center', width: 120, fixed: 'right',
      render: (_, r) => (
        <Space>
          <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          <Popconfirm title="Xác nhận xóa kỷ luật này?" description="Hành động này không thể hoàn tác."
            onConfirm={() => handleDelete(r.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <DisciplineStatistics disciplines={data} />

      <div style={{ display: 'flex', gap: 16 }}>
        <Card
          title={
            <Space>
              <FilterOutlined />
              <span>Bộ lọc</span>
              {activeFilterCount > 0 && <Badge count={activeFilterCount} style={{ backgroundColor: '#52c41a' }} />}
            </Space>
          }
          style={{ width: 280, flexShrink: 0, borderRadius: 8 }} size="small">
          <Space direction="vertical" style={{ width: '100%' }} size={12}>
            <div>
              <div style={{ fontSize: 11, marginBottom: 4, color: '#595959', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Số quyết định</div>
              <Input placeholder="Tìm số QĐ..." allowClear value={filterSoQD} onChange={e => setFilterSoQD(e.target.value)} />
            </div>
            <div>
              <div style={{ fontSize: 11, marginBottom: 4, color: '#595959', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Thời gian</div>
              <RangePicker
                style={{ width: '100%' }}
                placeholder={['Từ ngày', 'Đến ngày']}
                format="DD/MM/YYYY"
                onChange={handleDateRangeChange}
                value={filterNgayTu && filterNgayDen ? [dayjs(filterNgayTu), dayjs(filterNgayDen)] : null}
              />
            </div>
            <div>
              <div style={{ fontSize: 11, marginBottom: 4, color: '#595959', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Hình thức</div>
              <Select style={{ width: '100%' }} value={filterHinhThuc} onChange={setFilterHinhThuc}
                options={[
                  { value: 'ALL', label: 'Tất cả' },
                  ...hinhThucKLList.map(ht => ({ value: ht.ten_hinh_thuc_ky_luat, label: ht.ten_hinh_thuc_ky_luat }))
                ]} />
            </div>
            <Button block icon={<ClearOutlined />} onClick={() => { setFilterHinhThuc('ALL'); setFilterSoQD(''); setFilterNgayTu(''); setFilterNgayDen('') }}>Đặt lại</Button>
          </Space>
        </Card>

        <div style={{ flex: 1 }}>
          <Card
            title={<span>Danh sách kỷ luật</span>}
            extra={
              <Space>
                <Button type="primary" style={{ background: 'linear-gradient(135deg, #3e57c4db 0%, #2b1eb5c5 100%)', border: 'none', boxShadow: '0 2px 8px rgba(102, 126, 234, 0.4)' }} icon={<PlusOutlined />} onClick={openCreate}>Thêm mới</Button>
                <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>Làm mới</Button>
              </Space>
            }
            styles={{
              header: { background: 'linear-gradient(to right, #fafafa, #ffffff)', borderBottom: '2px solid #f0f0f0' },
              body: { padding: 0 }
            }}
            style={{ borderRadius: 8 }}
          >
            <Table size="middle" rowKey="id" loading={loading} dataSource={filteredData} columns={columns}
              locale={{ emptyText: 'Không có dữ liệu' }}
              pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t: number) => `${t} kỷ luật`, pageSizeOptions: ['10', '20', '50', '100'] }}
              scroll={{ x: 'max-content' }}
            />
          </Card>

          <Modal title={`${editItem ? 'Cập nhật' : 'Thêm'} kỷ luật`} open={modalOpen} width={640}
            onCancel={() => setModalOpen(false)} onOk={handleSubmit} confirmLoading={submitting}
            okButtonProps={{ disabled: submitting }}
            okText={editItem ? 'Cập nhật' : 'Thêm'} cancelText="Hủy">
            <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
              <Form.Item name="vi_pham_id" label="Vi phạm" rules={[{ required: true, message: 'Chọn vi phạm' }]}>
                <Select showSearch placeholder="Tìm và chọn vi phạm..." optionFilterProp="label" size="large"
                  options={viPhamList.map(vp => ({
                    value: vp.id,
                    label: `${vp.hocVien?.ho_ten ?? 'HV #' + vp.hoc_vien_id} – ${vp.noi_dung ?? 'Không có nội dung'}`,
                  }))}
                />
              </Form.Item>
              <Form.Item name="hinh_thuc" label="Hình thức kỷ luật" rules={[{ required: true, message: 'Chọn hình thức kỷ luật' }]}>
                <Select showSearch placeholder="Chọn hình thức kỷ luật..." optionFilterProp="label" size="large"
                  options={hinhThucKLList.map(ht => ({
                    value: ht.id,
                    label: `${ht.ten_hinh_thuc_ky_luat} (${ht.muc_do})`,
                  }))}
                />
              </Form.Item>
              <Form.Item name="so_quyet_dinh" label="Số quyết định"><Input size="large" /></Form.Item>
              <Form.Item name="ngay_quyet_dinh" label="Ngày quyết định"><Input type="date" size="large" /></Form.Item>
            </Form>
          </Modal>
        </div>
      </div>
    </div>
  )
}

/* ================================================================
   TRANG CHÍNH
   ================================================================ */
export default function ViPhamKyLuat() {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)

  const reportGroups: ReportGroup[] = [
    {
      title: 'Báo cáo vi phạm',
      items: [
        { key: 'bc15', label: 'BC15 - Vi phạm theo trung đội', onExport: (f: ReportModalFilters) => reportService.bc15ViPham(f.donViId!), requires: ['donVi'] },
      ],
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        title="Quản lý vi phạm - Kỷ luật"
        subtitle="Theo dõi và xử lý kỷ luật học viên"
        breadcrumbs={[{ label: 'Vi phạm - Kỷ luật' }]}
        extra={
          <Button icon={<DownloadOutlined />} onClick={() => setIsReportModalOpen(true)}>
            Xuất báo cáo
          </Button>
        }
      />
      <Tabs
        items={[
          { key: 'vi-pham', label: 'Vi phạm', children: <TabViPham /> },
          { key: 'ky-luat', label: 'Kỷ luật', children: <TabKyLuat /> },
        ]}
        size="large"
        style={{
          background: '#fff',
          padding: '16px 24px',
          borderRadius: 8,
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
        }}
      />
      <ReportExportModal
        open={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        groups={reportGroups}
        selectors={['donVi']}
        title="Xuất báo cáo vi phạm - kỷ luật"
      />
    </PageContainer>
  )
}
