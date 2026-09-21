import { useEffect, useState } from 'react'
import { Modal, Form, Input, Select, DatePicker, Checkbox, Button, message, Row, Col, Typography } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import { studentService } from '@/services/student.service'
import { api } from '@/lib/axios'
import dayjs from 'dayjs'

const { Text } = Typography

const unwrapLookup = (res: any) => {
  const d = res.data?.data ?? res.data
  return d?.data ?? d
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  student: any
}

export default function UpdateStudentModal({ isOpen, onClose, onSuccess, student }: Props) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [donViDoiList, setDonViDoiList] = useState<any[]>([])

  useEffect(() => {
    api.get('/don-vi-doi').then(res => {
      const list = unwrapLookup(res)
      setDonViDoiList(Array.isArray(list) ? list : [])
    }).catch(() => { })
  }, [])

  useEffect(() => {
    if (student && isOpen) {
      form.setFieldsValue({
        ma_hoc_vien: student.ma_hoc_vien || '',
        ho_ten: student.ho_ten || '',
        gioi_tinh: student.gioi_tinh || 'NAM',
        ngay_sinh: student.ngay_sinh ? dayjs(student.ngay_sinh) : null,
        so_dien_thoai: student.so_dien_thoai || '',
        que_quan: student.que_quan || '',
        dan_toc: student.dan_toc || '',
        tinh_trang_hon_nhan: student.tinh_trang_hon_nhan || 'CHUA_CO_GIA_DINH',
        chuc_vu: student.chuc_vu || '',
        don_vi_doi_id: student.don_vi_doi_id || '',
        cam_tinh_dang: student.cam_tinh_dang || false,
        ngay_vao_dang: student.ngay_vao_dang ? dayjs(student.ngay_vao_dang) : null,
        ngay_vao_doan: student.ngay_vao_doan ? dayjs(student.ngay_vao_doan) : null,
      })
      setIsDirty(false)
    }
  }, [student, isOpen, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      const payload: any = {}

      Object.entries(values).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          if (key === 'don_vi_doi_id') {
            payload[key] = Number(value)
          } else if (key === 'ngay_sinh' || key === 'ngay_vao_dang') {
            if (value && (value as any).toISOString) {
              payload[key] = (value as any).toISOString()
            }
          } else {
            payload[key] = value
          }
        }
      })

      await studentService.update(student.id, payload)
      message.success('Cập nhật thành công!')
      onSuccess()
      onClose()
    } catch (error: any) {
      if (error.errorFields) return
      const msg = error.response?.status === 404
        ? 'Không tìm thấy học viên này trên hệ thống (ID: ' + student.id + ')'
        : (error.response?.data?.error?.message || 'Lỗi cập nhật dữ liệu')
      message.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    setIsDirty(false)
    onClose()
  }

  return (
    <Modal
      open={isOpen}
      onCancel={handleCancel}
      title={`Chỉnh sửa học viên: ${student?.ho_ten || ''}`}
      width={900}
      footer={[
        <Button key="cancel" onClick={handleCancel} disabled={loading}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          icon={<SaveOutlined />}
          loading={loading}
          disabled={loading || !isDirty}
          onClick={handleSubmit}
        >
          Cập nhật
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" onValuesChange={() => setIsDirty(true)}>
        <Row gutter={24}>
          {/* Nhóm 1: Cơ bản */}
          <Col span={8}>
            <Text strong style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              Cơ bản
            </Text>
            <Form.Item label="Mã HV" name="ma_hoc_vien" rules={[{ required: true, message: 'Bắt buộc' }]}>
              <Input disabled />
            </Form.Item>
            <Form.Item label="Họ và tên" name="ho_ten" rules={[{ required: true, message: 'Bắt buộc' }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Giới tính" name="gioi_tinh">
              <Select
                options={[
                  { value: 'NAM', label: 'Nam' },
                  { value: 'NU', label: 'Nữ' },
                ]}
              />
            </Form.Item>
            <Form.Item label="Ngày sinh" name="ngay_sinh">
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>

          {/* Nhóm 2: Liên hệ */}
          <Col span={8}>
            <Text strong style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              Liên hệ
            </Text>
            <Form.Item
              label="SĐT"
              name="so_dien_thoai"
              rules={[
                { pattern: /^[0-9]+$/, message: 'Số điện thoại chỉ được chứa chữ số' },
              ]}
            >
              <Input maxLength={15} />
            </Form.Item>
            <Form.Item label="Quê quán" name="que_quan">
              <Input />
            </Form.Item>
            <Form.Item label="Hôn nhân" name="tinh_trang_hon_nhan">
              <Select
                options={[
                  { value: 'CHUA_CO_GIA_DINH', label: 'Chưa có GĐ' },
                  { value: 'DA_CO_GIA_DINH', label: 'Đã có GĐ' },
                  { value: 'LY_HON', label: 'Ly hôn' },
                ]}
              />
            </Form.Item>
            <Form.Item label="Dân tộc" name="dan_toc">
              <Input />
            </Form.Item>
          </Col>

          {/* Nhóm 3: Hệ thống */}
          <Col span={8}>
            <Text strong style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              Hệ thống
            </Text>
            <Form.Item label="Chức vụ" name="chuc_vu">
              <Input />
            </Form.Item>
            <Form.Item label="Đơn vị" name="don_vi_doi_id">
              <Select
                showSearch
                allowClear
                placeholder="Chọn đơn vị..."
                optionFilterProp="label"
                options={donViDoiList.map((d: any) => ({
                  value: d.id,
                  label: d.ten_don_vi ?? d.ma_don_vi ?? `Đơn vị #${d.id}`,
                }))}
              />
            </Form.Item>
            <Form.Item name="cam_tinh_dang" valuePropName="checked">
              <Checkbox>Đảng viên</Checkbox>
            </Form.Item>
            <Form.Item label="Ngày vào Đảng" name="ngay_vao_dang">
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item label="Ngày vào Đoàn" name="ngay_vao_doan">
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}