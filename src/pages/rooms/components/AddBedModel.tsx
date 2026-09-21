import { Modal, Form, Input, message } from 'antd'
import { useEffect, useState } from 'react'
import { bedService } from '@/services/beds.service'
import type { Bed, CreateBedDto, UpdateBedDto } from '@/types/beds'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  phongId: number
  bed?: Bed | null
}

export default function AddBedModel({ isOpen, onClose, onSuccess, phongId, bed }: Props) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (bed) {
        form.setFieldsValue({
          ma_giuong: bed.ma_giuong,
        })
      } else {
        form.resetFields()
      }
    }
  }, [isOpen, bed])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)

      if (bed) {
        // Update
        const payload: UpdateBedDto = {
          ma_giuong: values.ma_giuong,
        }
        await bedService.update(bed.id, payload)
        message.success('Cập nhật giường thành công')
      } else {
        // Create
        const payload: CreateBedDto = {
          ma_giuong: values.ma_giuong,
          phong_id: phongId,
        }
        await bedService.create(payload)
        message.success('Thêm giường thành công')
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      if (err?.errorFields) return // validation error
      message.error(err?.response?.data?.message || (bed ? 'Cập nhật giường thất bại' : 'Thêm giường thất bại'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title={bed ? `Chỉnh sửa giường: ${bed.ma_giuong}` : 'Thêm giường mới'}
      open={isOpen}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={submitting}
      okText={bed ? 'Lưu' : 'Thêm'}
      cancelText="Hủy"
      destroyOnClose
    >
      <Form 
        form={form} 
        layout="vertical" 
        style={{ marginTop: 16 }}
      >
        <Form.Item 
          name="ma_giuong" 
          label="Mã giường" 
          rules={[{ required: true, message: 'Vui lòng nhập mã giường' }]}
        >
          <Input 
            placeholder="Nhập mã giường (VD: G01, G02...)" 
            size="large"
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
