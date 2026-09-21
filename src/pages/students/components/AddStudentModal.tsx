import { useEffect, useState } from 'react'
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Checkbox,
  Button,
  message,
  Row,
  Col,
  Typography,
} from 'antd'
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
}

export default function AddStudentModal({
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [donViDoiList, setDonViDoiList] = useState<any[]>([])
  const [camTinhDang, setCamTinhDang] = useState(false)

  useEffect(() => {
    api
      .get('/don-vi-doi')
      .then((res) => {
        const list = unwrapLookup(res)
        setDonViDoiList(Array.isArray(list) ? list : [])
      })
      .catch(() => { })
  }, [])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      const payload: any = {}

      Object.entries(values).forEach(([key, value]) => {
        const trimmed = typeof value === 'string' ? value.trim() : value
        if (trimmed !== '' && trimmed !== null && trimmed !== undefined) {
          if (key === 'don_vi_doi_id' || key === 'lop_hoc_id') {
            payload[key] = Number(trimmed)
          } else if (
            key === 'ngay_sinh' ||
            key === 'ngay_vao_dang' ||
            key === 'ngay_vao_doan'
          ) {
            if (value && (value as any).toISOString) {
              payload[key] = (value as any).toISOString()
            }
          } else {
            payload[key] = trimmed
          }
        }
      })

      await studentService.create(payload)

      message.success('Thêm học viên thành công!')
      form.resetFields()
      setCamTinhDang(false)
      onSuccess()
      onClose()
    } catch (error: any) {
      if (error.errorFields) return

      const errorMsg =
        error.response?.data?.error?.message || 'Lỗi dữ liệu đầu vào'

      message.error(
        Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg,
      )
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    setCamTinhDang(false)
    onClose()
  }

  return (
    <Modal
      open={isOpen}
      onCancel={handleCancel}
      title="Thêm học viên mới"
      width={900}
      footer={[
        <Button key="cancel" onClick={handleCancel} disabled={loading}>
          Hủy bỏ
        </Button>,
        <Button
          key="submit"
          type="primary"
          icon={<SaveOutlined />}
          loading={loading}
          disabled={loading}
          onClick={handleSubmit}
        >
          Lưu học viên
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          gioi_tinh: 'NAM',
          dan_toc: 'Kinh',
          tinh_trang_hon_nhan: 'CHUA_CO_GIA_DINH',
          cam_tinh_dang: false,
        }}
        onValuesChange={(changedValues) => {
          if ('cam_tinh_dang' in changedValues) {
            setCamTinhDang(changedValues.cam_tinh_dang)

            if (changedValues.cam_tinh_dang) {
              form.setFieldValue('ngay_vao_dang', null)
            }
          }
        }}
      >
        <Row gutter={24}>
          {/* CỘT 1 */}
          <Col span={8}>
            <Text
              strong
              style={{
                fontSize: 11,
                color: '#999',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 8,
              }}
            >
              Cơ bản
            </Text>

            <Form.Item
              label="Mã học viên"
              name="ma_hoc_vien"
              rules={[
                { required: true, message: 'Bắt buộc' },
                { whitespace: true, message: 'Không được chỉ nhập khoảng trắng' },
              ]}
            >
              <Input placeholder="Nhập mã học viên" />
            </Form.Item>

            <Form.Item
              label="Họ và tên"
              name="ho_ten"
              rules={[
                { required: true, message: 'Bắt buộc' },
                { whitespace: true, message: 'Không được chỉ nhập khoảng trắng' },
              ]}
            >
              <Input placeholder="Nhập họ và tên" />
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
              <DatePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày sinh"
                disabledDate={(current) =>
                  current && current > dayjs().endOf('day')
                }
              />
            </Form.Item>
          </Col>

          {/* CỘT 2 */}
          <Col span={8}>
            <Text
              strong
              style={{
                fontSize: 11,
                color: '#999',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 8,
              }}
            >
              Chi tiết
            </Text>

            <Form.Item
              label="Số điện thoại"
              name="so_dien_thoai"
              rules={[
                {
                  pattern: /^[0-9]+$/,
                  message: 'Chỉ được nhập số',
                },
              ]}
            >
              <Input
                placeholder="Nhập SĐT"
                inputMode="numeric"
                onChange={(e) => {
                  const onlyNumber = e.target.value.replace(/\D/g, '')
                  form.setFieldValue('so_dien_thoai', onlyNumber)
                }}
              />
            </Form.Item>

            <Form.Item
              label="Quê quán"
              name="que_quan"
              rules={[{ whitespace: true, message: 'Không được chỉ nhập khoảng trắng' }]}
            >
              <Input placeholder="Nhập quê quán" />
            </Form.Item>

            <Form.Item
              label="Dân tộc"
              name="dan_toc"
              rules={[{ whitespace: true, message: 'Không được chỉ nhập khoảng trắng' }]}
            >
              <Input placeholder="Nhập dân tộc" />
            </Form.Item>

            <Form.Item label="Hôn nhân" name="tinh_trang_hon_nhan">
              <Select
                options={[
                  { value: 'CHUA_CO_GIA_DINH', label: 'Chưa có gia đình' },
                  { value: 'DA_CO_GIA_DINH', label: 'Đã có gia đình' },
                  { value: 'LY_HON', label: 'Ly hôn' },
                ]}
              />
            </Form.Item>
          </Col>

          {/* CỘT 3 */}
          <Col span={8}>
            <Text
              strong
              style={{
                fontSize: 11,
                color: '#999',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 8,
              }}
            >
              Công tác
            </Text>

            <Form.Item
              label="Chức vụ"
              name="chuc_vu"
              rules={[{ whitespace: true, message: 'Không được chỉ nhập khoảng trắng' }]}
            >
              <Input placeholder="Nhập chức vụ" />
            </Form.Item>

            <Form.Item label="Đơn vị" name="don_vi_doi_id">
              <Select
                showSearch
                allowClear
                placeholder="Chọn đơn vị..."
                optionFilterProp="label"
                options={donViDoiList.map((d: any) => ({
                  value: d.id,
                  label:
                    d.ten_don_vi ??
                    d.ma_don_vi ??
                    `Đơn vị #${d.id}`,
                }))}
              />
            </Form.Item>

            <Form.Item
              name="cam_tinh_dang"
              valuePropName="checked"
            >
              <Checkbox>Đảng viên</Checkbox>
            </Form.Item>

            <Form.Item label="Ngày vào Đoàn" name="ngay_vao_doan">
              <DatePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày"
                disabledDate={(current) =>
                  current && current > dayjs().endOf('day')
                }
              />
            </Form.Item>

            <Form.Item
              label="Ngày vào Đảng"
              name="ngay_vao_dang"
              dependencies={['ngay_vao_doan']}
              rules={[
                {
                  validator(_, value) {
                    if (!value) return Promise.resolve()
                    if (dayjs(value).isAfter(dayjs(), 'day'))
                      return Promise.reject(new Error('Ngày vào Đảng không được lớn hơn ngày hiện tại'))
                    return Promise.resolve()
                  },
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const ngayVaoDoan = getFieldValue('ngay_vao_doan')
                    if (!value || !ngayVaoDoan) return Promise.resolve()
                    if (dayjs(value).isAfter(dayjs(ngayVaoDoan))) return Promise.resolve()
                    return Promise.reject(new Error('Ngày vào Đảng phải sau Ngày vào Đoàn'))
                  },
                }),
              ]}
            >
              <DatePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày"
                disabled={camTinhDang}
                disabledDate={(current) => {
                  const ngayVaoDoan = form.getFieldValue('ngay_vao_doan')
                  if (!ngayVaoDoan) return current && current > dayjs().endOf('day')
                  return (
                    (current && current > dayjs().endOf('day')) ||
                    !dayjs(current).isAfter(dayjs(ngayVaoDoan), 'day')
                  )
                }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}