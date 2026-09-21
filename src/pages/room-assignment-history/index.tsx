import { useEffect, useState } from 'react'
import {
  Table, Modal, Form, Input, Select, Button, Card, Tag,
  Space, Popconfirm, message, DatePicker, Switch, Row, Col, Statistic, Tabs, Radio,
} from 'antd'
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
  HistoryOutlined, SwapOutlined, HomeOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { PageHeader, PageContainer } from '@/components'
import {
  lichSuBoTriPhongService,
  type LichSuBoTriPhong,
  type CreateLichSuBoTriPhongDto,
} from '@/services/room-assignment.service'
import { buildService } from '@/services/build.service'
import { floorService } from '@/services/floor.service'
import { roomService } from '@/services/room.service'
import { studentService } from '@/services/student.service'
import { classService } from '@/services/class.service'
import { courseService } from '@/services/course.service'

const { TextArea } = Input

type TransferScope = 'manual' | 'class' | 'course'

function BulkTransferTab() {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const [sourceBuildings, setSourceBuildings] = useState<any[]>([])
  const [sourceFloors, setSourceFloors] = useState<any[]>([])
  const [sourceRooms, setSourceRooms] = useState<any[]>([])
  const [targetFloors, setTargetFloors] = useState<any[]>([])
  const [targetRooms, setTargetRooms] = useState<any[]>([])
  const [sourceStudents, setSourceStudents] = useState<Array<{ id: number; label: string }>>([])
  const [classes, setClasses] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [scope, setScope] = useState<TransferScope>('manual')

  useEffect(() => {
    const loadInitial = async () => {
      try {
        const [buildingData, classData, courseData] = await Promise.all([
          buildService.getAll(),
          classService.getAll(),
          courseService.getAll(),
        ])
        setSourceBuildings(Array.isArray(buildingData) ? buildingData : [])
        setClasses(Array.isArray(classData) ? classData : [])
        setCourses(Array.isArray(courseData) ? courseData : [])
      } catch {
        message.error('Không thể tải dữ liệu danh mục cho chuyển phòng')
      }
    }
    loadInitial()
  }, [])

  const loadSourceFloors = async (buildingId: number) => {
    form.setFieldsValue({ source_floor_id: undefined, phong_nguon_id: undefined })
    setSourceFloors([])
    setSourceRooms([])
    setSourceStudents([])

    if (!buildingId) return
    try {
      const data = await floorService.getByBuild(buildingId)
      setSourceFloors(Array.isArray(data) ? data : [])
    } catch {
      message.error('Không thể tải tầng nguồn')
    }
  }

  const loadTargetFloors = async (buildingId: number) => {
    form.setFieldsValue({ target_floor_id: undefined, phong_dich_id: undefined })
    setTargetFloors([])
    setTargetRooms([])

    if (!buildingId) return
    try {
      const data = await floorService.getByBuild(buildingId)
      setTargetFloors(Array.isArray(data) ? data : [])
    } catch {
      message.error('Không thể tải tầng đích')
    }
  }

  const loadSourceRooms = async (floorId: number) => {
    form.setFieldsValue({ phong_nguon_id: undefined, hoc_vien_ids: [] })
    setSourceRooms([])
    setSourceStudents([])

    if (!floorId) return
    try {
      const allRooms = await roomService.getAll()
      const filtered = Array.isArray(allRooms) ? allRooms.filter((room: any) => room.tang_id === floorId) : []
      setSourceRooms(filtered)
    } catch {
      message.error('Không thể tải phòng nguồn')
    }
  }

  const loadTargetRooms = async (floorId: number) => {
    form.setFieldsValue({ phong_dich_id: undefined })
    setTargetRooms([])

    if (!floorId) return
    try {
      const allRooms = await roomService.getAll()
      const sourceRoomId = form.getFieldValue('phong_nguon_id')
      const filtered = Array.isArray(allRooms)
        ? allRooms.filter((room: any) => room.tang_id === floorId && room.id !== sourceRoomId)
        : []
      setTargetRooms(filtered)
    } catch {
      message.error('Không thể tải phòng đích')
    }
  }

  const loadSourceStudents = async (sourceRoomId: number) => {
    form.setFieldsValue({ hoc_vien_ids: [] })
    setSourceStudents([])

    if (!sourceRoomId) return
    try {
      const assignments = await lichSuBoTriPhongService.getAll()
      const currentStudents = (Array.isArray(assignments) ? assignments : [])
        .filter((item: any) => item.dang_o === true && item.phong_id === sourceRoomId && item.hocVien)
        .map((item: any) => ({
          id: item.hocVien.id,
          label: `${item.hocVien.ho_ten} (${item.hocVien.ma_hoc_vien || item.hocVien.id})`,
        }))
      setSourceStudents(currentStudents)
    } catch {
      message.error('Không thể tải danh sách học viên phòng nguồn')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const payload: any = {
        phong_nguon_id: values.phong_nguon_id,
        phong_dich_id: values.phong_dich_id,
        ly_do: values.ly_do,
      }

      if (scope === 'manual') {
        if (!values.hoc_vien_ids || values.hoc_vien_ids.length === 0) {
          message.error('Vui lòng chọn ít nhất 1 học viên để chuyển phòng')
          return
        }
        payload.hoc_vien_ids = values.hoc_vien_ids
      }

      if (scope === 'class') {
        if (!values.lop_hoc_id) {
          message.error('Vui lòng chọn lớp học')
          return
        }
        payload.lop_hoc_id = values.lop_hoc_id
      }

      if (scope === 'course') {
        if (!values.khoa_hoc_id) {
          message.error('Vui lòng chọn khóa học')
          return
        }
        payload.khoa_hoc_id = values.khoa_hoc_id
      }

      setSubmitting(true)
      const result = await lichSuBoTriPhongService.chuyenPhongHangLoat(payload)
      message.success(result?.message || 'Chuyển phòng hàng loạt thành công')
      form.resetFields()
      setSourceFloors([])
      setSourceRooms([])
      setTargetFloors([])
      setTargetRooms([])
      setSourceStudents([])
      setScope('manual')
    } catch (error: any) {
      if (error?.errorFields) return
      const msg = error?.response?.data?.data?.message || error?.response?.data?.message || 'Chuyển phòng thất bại'
      message.error(Array.isArray(msg) ? msg.join(', ') : msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label="Tòa nhà nguồn" name="source_building_id" rules={[{ required: true, message: 'Chọn tòa nhà nguồn' }]}>
              <Select
                showSearch
                placeholder="Chọn tòa nhà nguồn"
                optionFilterProp="label"
                onChange={loadSourceFloors}
                options={sourceBuildings.map((item: any) => ({
                  value: item.id,
                  label: item.ten_toa ?? item.ma_toa ?? `Tòa nhà #${item.id}`,
                }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Tầng nguồn" name="source_floor_id" rules={[{ required: true, message: 'Chọn tầng nguồn' }]}>
              <Select
                showSearch
                placeholder="Chọn tầng nguồn"
                optionFilterProp="label"
                disabled={sourceFloors.length === 0}
                onChange={loadSourceRooms}
                options={sourceFloors.map((item: any) => ({ value: item.id, label: `Tầng ${item.so_tang ?? item.id}` }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label="Phòng nguồn" name="phong_nguon_id" rules={[{ required: true, message: 'Chọn phòng nguồn' }]}>
              <Select
                showSearch
                placeholder="Chọn phòng nguồn"
                optionFilterProp="label"
                disabled={sourceRooms.length === 0}
                onChange={loadSourceStudents}
                options={sourceRooms.map((item: any) => ({ value: item.id, label: item.ma_phong }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Tòa nhà đích" name="target_building_id" rules={[{ required: true, message: 'Chọn tòa nhà đích' }]}>
              <Select
                showSearch
                placeholder="Chọn tòa nhà đích"
                optionFilterProp="label"
                onChange={loadTargetFloors}
                options={sourceBuildings.map((item: any) => ({
                  value: item.id,
                  label: item.ten_toa ?? item.ma_toa ?? `Tòa nhà #${item.id}`,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label="Tầng đích" name="target_floor_id" rules={[{ required: true, message: 'Chọn tầng đích' }]}>
              <Select
                showSearch
                placeholder="Chọn tầng đích"
                optionFilterProp="label"
                disabled={targetFloors.length === 0}
                onChange={loadTargetRooms}
                options={targetFloors.map((item: any) => ({ value: item.id, label: `Tầng ${item.so_tang ?? item.id}` }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Phòng đích" name="phong_dich_id" rules={[{ required: true, message: 'Chọn phòng đích' }]}>
              <Select
                showSearch
                placeholder="Chọn phòng đích"
                optionFilterProp="label"
                disabled={targetRooms.length === 0}
                options={targetRooms.map((item: any) => ({ value: item.id, label: item.ma_phong }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Phạm vi chuyển phòng">
          <Radio.Group
            value={scope}
            onChange={(event) => {
              setScope(event.target.value)
              form.setFieldsValue({ hoc_vien_ids: [], lop_hoc_id: undefined, khoa_hoc_id: undefined })
            }}
          >
            <Radio.Button value="manual">Theo danh sách học viên</Radio.Button>
            <Radio.Button value="class">Theo lớp học</Radio.Button>
            <Radio.Button value="course">Theo khóa học</Radio.Button>
          </Radio.Group>
        </Form.Item>

        {scope === 'manual' && (
          <Form.Item name="hoc_vien_ids" label={`Học viên cần chuyển (${sourceStudents.length} đang ở phòng nguồn)`}>
            <Select
              mode="multiple"
              showSearch
              allowClear
              placeholder="Chọn học viên"
              optionFilterProp="label"
              disabled={sourceStudents.length === 0}
              options={sourceStudents.map((student) => ({ value: student.id, label: student.label }))}
            />
          </Form.Item>
        )}

        {scope === 'class' && (
          <Form.Item name="lop_hoc_id" label="Lớp học">
            <Select
              showSearch
              allowClear
              placeholder="Chọn lớp học để chuyển phòng"
              optionFilterProp="label"
              options={classes.map((item: any) => ({
                value: item.id,
                label: `${item.ten_lop || item.ma_lop} (${item.ma_lop})`,
              }))}
            />
          </Form.Item>
        )}

        {scope === 'course' && (
          <Form.Item name="khoa_hoc_id" label="Khóa học">
            <Select
              showSearch
              allowClear
              placeholder="Chọn khóa học để chuyển phòng"
              optionFilterProp="label"
              options={courses.map((item: any) => ({ value: item.id, label: `${item.ten_khoa} (${item.ma_khoa})` }))}
            />
          </Form.Item>
        )}

        <Form.Item name="ly_do" label="Lý do chuyển phòng">
          <TextArea rows={3} placeholder="Nhập lý do (tùy chọn)" />
        </Form.Item>

        <Space>
          <Button type="primary" icon={<SwapOutlined />} onClick={handleSubmit} loading={submitting}>
            Xác nhận chuyển phòng hàng loạt
          </Button>
          <Button
            onClick={() => {
              form.resetFields()
              setSourceFloors([])
              setSourceRooms([])
              setTargetFloors([])
              setTargetRooms([])
              setSourceStudents([])
              setScope('manual')
            }}
          >
            Đặt lại
          </Button>
        </Space>
      </Form>
    </Card>
  )
}

export function RoomAssignmentHistoryTab() {
  const [data, setData] = useState<LichSuBoTriPhong[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState<LichSuBoTriPhong | null>(null)
  const [form] = Form.useForm()
  const [rooms, setRooms] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])

  const fetchData = async () => {
    setLoading(true)
    try {
      const result = await lichSuBoTriPhongService.getAll()
      setData(Array.isArray(result) ? result : [])
    } catch {
      message.error('Không thể tải dữ liệu lịch sử bố trí phòng')
    } finally {
      setLoading(false)
    }
  }

  const fetchDropdowns = async () => {
    try {
      const [roomRes, studentRes] = await Promise.all([
        roomService.getAll(),
        studentService.getAll(),
      ])
      setRooms(Array.isArray(roomRes) ? roomRes : [])
      setStudents(Array.isArray(studentRes) ? studentRes : [])
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

  const handleEdit = (record: LichSuBoTriPhong) => {
    setEditingRecord(record)
    form.setFieldsValue({
      ...record,
      tu_ngay: record.tu_ngay ? dayjs(record.tu_ngay) : null,
      den_ngay: record.den_ngay ? dayjs(record.den_ngay) : null,
    })
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const dto: CreateLichSuBoTriPhongDto = {
        ...values,
        tu_ngay: values.tu_ngay?.toISOString(),
        den_ngay: values.den_ngay?.toISOString(),
      }

      if (editingRecord) {
        await lichSuBoTriPhongService.update(editingRecord.id, dto)
        message.success('Cập nhật thành công')
      } else {
        await lichSuBoTriPhongService.create(dto)
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
      await lichSuBoTriPhongService.delete(id)
      message.success('Xoá thành công')
      fetchData()
    } catch {
      message.error('Xoá thất bại')
    }
  }

  // Statistics
  const totalRecords = data.length
  const dangO = data.filter((d) => d.dang_o).length
  const daTraPhong = data.filter((d) => d.hinh_thuc_xu_ly === 'TRA_PHONG').length
  const chuyenPhong = data.filter((d) => d.hinh_thuc_xu_ly === 'CHUYEN_PHONG').length

  const columns: ColumnsType<LichSuBoTriPhong> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Học viên',
      render: (_, r) => r.hocVien?.ho_ten || `#${r.hoc_vien_id || '-'}`,
      width: 160,
    },
    {
      title: 'Phòng',
      render: (_, r) => r.phong?.ma_phong || `#${r.phong_id || '-'}`,
      width: 100,
    },
    {
      title: 'Toà nhà',
      render: (_, r) => r.toaNha?.ten_toa || r.toaNha?.ma_toa || '-',
      width: 120,
    },
    {
      title: 'Từ ngày',
      dataIndex: 'tu_ngay',
      render: (v) => v ? dayjs(v).format('DD/MM/YYYY') : '-',
      width: 120,
    },
    {
      title: 'Đến ngày',
      dataIndex: 'den_ngay',
      render: (v) => v ? dayjs(v).format('DD/MM/YYYY') : '-',
      width: 120,
    },
    {
      title: 'Đang ở',
      dataIndex: 'dang_o',
      width: 80,
      render: (v) => v ? <Tag color="green">Có</Tag> : <Tag color="default">Không</Tag>,
    },
    {
      title: 'Hình thức',
      dataIndex: 'hinh_thuc_xu_ly',
      width: 130,
      render: (v) => {
        if (v === 'TRA_PHONG') return <Tag color="orange">Trả phòng</Tag>
        if (v === 'CHUYEN_PHONG') return <Tag color="blue">Chuyển phòng</Tag>
        return '-'
      },
    },
    {
      title: 'Người thực hiện',
      render: (_, r) => r.nguoiThucHien?.hoTen || '-',
      width: 150,
    },
    {
      title: 'Lý do',
      dataIndex: 'ly_do',
      ellipsis: true,
      width: 200,
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
      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6}>
          <Card hoverable style={{ borderTop: '3px solid #1890ff' }}>
            <Statistic title="Tổng bản ghi" value={totalRecords} prefix={<HistoryOutlined />} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card hoverable style={{ borderTop: '3px solid #52c41a' }}>
            <Statistic title="Đang ở" value={dangO} prefix={<HomeOutlined />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card hoverable style={{ borderTop: '3px solid #fa8c16' }}>
            <Statistic title="Trả phòng" value={daTraPhong} valueStyle={{ color: '#fa8c16' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card hoverable style={{ borderTop: '3px solid #722ed1' }}>
            <Statistic title="Chuyển phòng" value={chuyenPhong} prefix={<SwapOutlined />} valueStyle={{ color: '#722ed1' }} />
          </Card>
        </Col>
      </Row>

      <Card
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
          dataSource={data}
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `Tổng ${t}`, pageSizeOptions: ['10', '20', '50', '100'] }}
        />
      </Card>

      {/* Modal Create/Edit */}
      <Modal
        title={editingRecord ? 'Cập nhật bố trí phòng' : 'Thêm bố trí phòng'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={640}
        okText={editingRecord ? 'Cập nhật' : 'Tạo mới'}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="hoc_vien_id" label="Học viên" rules={[{ required: true, message: 'Chọn học viên' }]}>
                <Select
                  showSearch
                  placeholder="Chọn học viên"
                  optionFilterProp="label"
                  options={students.map((s: any) => ({
                    label: `${s.ho_ten} (${s.ma_hoc_vien || s.id})`,
                    value: s.id,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phong_id" label="Phòng" rules={[{ required: true, message: 'Chọn phòng' }]}>
                <Select
                  showSearch
                  placeholder="Chọn phòng"
                  optionFilterProp="label"
                  options={rooms.map((r: any) => ({
                    label: r.ma_phong,
                    value: r.id,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="tu_ngay" label="Từ ngày">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="den_ngay" label="Đến ngày">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="hinh_thuc_xu_ly" label="Hình thức">
                <Select allowClear placeholder="Chọn hình thức">
                  <Select.Option value="TRA_PHONG">Trả phòng</Select.Option>
                  <Select.Option value="CHUYEN_PHONG">Chuyển phòng</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dang_o" label="Đang ở" valuePropName="checked">
                <Switch checkedChildren="Có" unCheckedChildren="Không" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="ly_do" label="Lý do">
            <TextArea rows={3} placeholder="Nhập lý do..." />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default function RoomAssignmentHistoryPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Điều chỉnh phòng"
        subtitle="Quản lý lịch sử bố trí và thực hiện chuyển phòng hàng loạt"
      />
      <Tabs
        defaultActiveKey="history"
        items={[
          {
            key: 'history',
            label: 'Lịch sử bố trí phòng',
            children: <RoomAssignmentHistoryTab />,
          },
          {
            key: 'bulk-transfer',
            label: 'Chuyển phòng hàng loạt',
            children: <BulkTransferTab />,
          },
        ]}
      />
    </PageContainer>
  )
}
