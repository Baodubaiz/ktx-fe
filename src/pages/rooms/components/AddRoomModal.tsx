import { Modal, Form, Input, InputNumber, Select, Row, Col, message } from 'antd'
import { useEffect, useState } from 'react'
import { useBuild } from '@/hooks/useBuild'
import { floorService } from '@/services/floor.service'
import { roomService } from '@/services/room.service'
import type { CreateRoomDto } from '@/types/room'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AddRoomModal({ isOpen, onClose, onSuccess }: Props) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const { builds, getBuilds } = useBuild()
  const [formFloors, setFormFloors] = useState<any[]>([])

  useEffect(() => {
    if (isOpen) {
      getBuilds()
      form.resetFields()
      setFormFloors([])
    }
  }, [isOpen])

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

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)

      const payload: CreateRoomDto = {
        ma_phong: values.ma_phong,
        tang_id: values.tang_id,
        so_giuong: values.so_giuong ?? undefined,
        loai_phong: values.loai_phong ?? undefined,
        gioi_tinh_phong: values.gioi_tinh_phong ?? undefined,
      }

      await roomService.create(payload)
      message.success('Tạo phòng thành công')
      form.resetFields()
      onSuccess()
      onClose()
    } catch (err: any) {
      if (err?.errorFields) return // validation error
      message.error(err?.response?.data?.message || 'Tạo phòng thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title="Thêm phòng mới"
      open={isOpen}
      onCancel={() => {
        onClose()
        form.resetFields()
      }}
      onOk={handleSubmit}
      confirmLoading={submitting}
      okButtonProps={{ disabled: submitting }}
      okText="Tạo"
      cancelText="Hủy"
      destroyOnClose
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 16 }}
      >
        <Form.Item
          name="ma_phong"
          label="Mã phòng"
          rules={[{ required: true, message: 'Vui lòng nhập mã phòng' }]}
        >
          <Input
            placeholder="Nhập mã phòng (VD: P101, A201...)"
            size="large"
          />
        </Form.Item>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              name="toa_nha_id"
              label="Tòa nhà"
              rules={[{ required: true, message: 'Vui lòng chọn tòa' }]}
            >
              <Select
                placeholder="Chọn tòa nhà"
                onChange={handleBuildChange}
                allowClear
                size="large"
                showSearch
                optionFilterProp="children"
              >
                {builds.map((b) => (
                  <Select.Option key={b.id} value={b.id}>
                    {b.ten_toa ?? b.ma_toa}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="tang_id"
              label="Tầng"
              rules={[{ required: true, message: 'Vui lòng chọn tầng' }]}
            >
              <Select
                placeholder="Chọn tầng"
                allowClear
                size="large"
                disabled={formFloors.length === 0}
              >
                {formFloors.map((f: any) => (
                  <Select.Option key={f.id} value={f.id}>
                    Tầng {f.so_tang}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="so_giuong"
          label="Số giường"
          tooltip="Số lượng giường trong phòng"
        >
          <InputNumber
            min={0}
            max={20}
            style={{ width: '100%' }}
            placeholder="Nhập số giường (VD: 4, 6, 8...)"
            size="large"
          />
        </Form.Item>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              name="loai_phong"
              label="Loại phòng"
            >
              <Select
                placeholder="Chọn loại phòng"
                allowClear
                size="large"
              >
                <Select.Option value="HOC_VIEN">Học Viên</Select.Option>
                <Select.Option value="CAN_BO">Cán Bộ</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="gioi_tinh_phong"
              label="Giới tính"
            >
              <Select
                placeholder="Chọn giới tính"
                allowClear
                size="large"
              >
                <Select.Option value="NAM">Nam</Select.Option>
                <Select.Option value="NU">Nữ</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}
