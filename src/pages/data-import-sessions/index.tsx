import { useEffect, useState } from 'react'
import {
  Table, Modal, Form, Input, Select, Button, Card, Tag,
  Space, Popconfirm, message, DatePicker, Row, Col, Statistic,
} from 'antd'
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
  UploadOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined,
  CheckOutlined, StopOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { PageHeader, PageContainer } from '@/components'
import {
  phienNhapDuLieuService,
  type PhienNhapDuLieu,
  type CreatePhienNhapDuLieuDto,
} from '@/services/data-import.service'

const { TextArea } = Input

export default function DataImportSessionsPage() {
  const [data, setData] = useState<PhienNhapDuLieu[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState<PhienNhapDuLieu | null>(null)
  const [form] = Form.useForm()

  const fetchData = async () => {
    setLoading(true)
    try {
      const result = await phienNhapDuLieuService.getAll()
      setData(Array.isArray(result) ? result : [])
    } catch {
      message.error('Không thể tải dữ liệu phiên nhập')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreate = () => {
    setEditingRecord(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record: PhienNhapDuLieu) => {
    setEditingRecord(record)
    form.setFieldsValue({
      ...record,
      thoi_diem_import: record.thoi_diem_import ? dayjs(record.thoi_diem_import) : null,
    })
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const dto: CreatePhienNhapDuLieuDto = {
        ...values,
        thoi_diem_import: values.thoi_diem_import?.toISOString(),
      }

      if (editingRecord) {
        await phienNhapDuLieuService.update(editingRecord.id, dto)
        message.success('Cập nhật thành công')
      } else {
        await phienNhapDuLieuService.create(dto)
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
      await phienNhapDuLieuService.delete(id)
      message.success('Xoá thành công')
      fetchData()
    } catch {
      message.error('Xoá thất bại')
    }
  }

  const handleApprove = async (id: number) => {
    try {
      await phienNhapDuLieuService.approve(id)
      message.success('Duyệt phiên thành công')
      fetchData()
    } catch (error: any) {
      const msg = error?.response?.data?.data?.message || error?.response?.data?.message || 'Duyệt phiên thất bại'
      message.error(msg)
    }
  }

  const handleReject = async (id: number) => {
    try {
      await phienNhapDuLieuService.reject(id)
      message.success('Từ chối phiên thành công')
      fetchData()
    } catch (error: any) {
      const msg = error?.response?.data?.data?.message || error?.response?.data?.message || 'Từ chối phiên thất bại'
      message.error(msg)
    }
  }

  // Statistics
  const totalRecords = data.length
  const daDuyet = data.filter((d) => d.trang_thai === 'DA_DUYET').length
  const dangDuyet = data.filter((d) => d.trang_thai === 'DANG_DUYET').length
  const tuChoi = data.filter((d) => d.trang_thai === 'TU_CHOI').length

  const columns: ColumnsType<PhienNhapDuLieu> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Loại dữ liệu',
      render: (_, r) => r.loaiDuLieu?.ten_loai || `#${r.loai_du_lieu_id || '-'}`,
      width: 180,
    },
    {
      title: 'Tên file',
      dataIndex: 'file_name',
      ellipsis: true,
      width: 200,
    },
    {
      title: 'Người import',
      render: (_, r) => r.nguoiImport?.hoTen || '-',
      width: 160,
    },
    {
      title: 'Thời điểm import',
      dataIndex: 'thoi_diem_import',
      render: (v) => v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '-',
      width: 170,
    },
    {
      title: 'Người duyệt',
      render: (_, r) => r.nguoiDuyet?.hoTen || '-',
      width: 160,
    },
    {
      title: 'Thời điểm duyệt',
      dataIndex: 'thoi_diem_duyet',
      render: (v) => v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '-',
      width: 170,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trang_thai',
      width: 130,
      render: (v) => {
        if (v === 'DA_DUYET') return <Tag color="green" icon={<CheckCircleOutlined />}>Đã duyệt</Tag>
        if (v === 'DANG_DUYET') return <Tag color="orange" icon={<ClockCircleOutlined />}>Đang duyệt</Tag>
        if (v === 'TU_CHOI') return <Tag color="red" icon={<CloseCircleOutlined />}>Từ chối</Tag>
        return '-'
      },
    },
    {
      title: 'Ghi chú',
      dataIndex: 'ghi_chu',
      ellipsis: true,
      width: 200,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          {record.trang_thai === 'DANG_DUYET' && (
            <>
              <Popconfirm title="Duyệt phiên nhập dữ liệu này?" onConfirm={() => handleApprove(record.id)}>
                <Button type="link" icon={<CheckOutlined />} />
              </Popconfirm>
              <Popconfirm title="Từ chối phiên nhập dữ liệu này?" onConfirm={() => handleReject(record.id)}>
                <Button type="link" danger icon={<StopOutlined />} />
              </Popconfirm>
            </>
          )}
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="Xoá bản ghi này?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        title="Phiên nhập dữ liệu"
        subtitle="Quản lý các phiên nhập (import) dữ liệu vào hệ thống"
      />

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6}>
          <Card hoverable style={{ borderTop: '3px solid #1890ff' }}>
            <Statistic title="Tổng phiên" value={totalRecords} prefix={<UploadOutlined />} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card hoverable style={{ borderTop: '3px solid #52c41a' }}>
            <Statistic title="Đã duyệt" value={daDuyet} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card hoverable style={{ borderTop: '3px solid #fa8c16' }}>
            <Statistic title="Đang duyệt" value={dangDuyet} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#fa8c16' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card hoverable style={{ borderTop: '3px solid #ff4d4f' }}>
            <Statistic title="Từ chối" value={tuChoi} prefix={<CloseCircleOutlined />} valueStyle={{ color: '#ff4d4f' }} />
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
          scroll={{ x: 1200 }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `Tổng ${t}`, pageSizeOptions: ['10', '20', '50', '100'] }}
        />
      </Card>

      {/* Modal Create/Edit */}
      <Modal
        title={editingRecord ? 'Cập nhật phiên nhập dữ liệu' : 'Thêm phiên nhập dữ liệu'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={580}
        okText={editingRecord ? 'Cập nhật' : 'Tạo mới'}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="file_name" label="Tên file">
            <Input placeholder="Nhập tên file..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="thoi_diem_import" label="Thời điểm import">
                <DatePicker showTime style={{ width: '100%' }} format="DD/MM/YYYY HH:mm" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="trang_thai" label="Trạng thái">
                <Select allowClear placeholder="Chọn trạng thái">
                  <Select.Option value="DANG_DUYET">Đang duyệt</Select.Option>
                  <Select.Option value="DA_DUYET">Đã duyệt</Select.Option>
                  <Select.Option value="TU_CHOI">Từ chối</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="ghi_chu" label="Ghi chú">
            <TextArea rows={3} placeholder="Ghi chú thêm..." />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  )
}
