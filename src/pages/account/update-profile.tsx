import { useState } from 'react'
import { Modal, Form, Input, message } from 'antd'
import { UserOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons'

import type { User } from '@/types/user'

interface Props {
  isOpen: boolean
  onClose: () => void
  user: User
  onSuccess: (updatedUser: any) => void
  updateFn: (id: number, data: any) => Promise<any>
}

export default function EditProfileModal({ isOpen, onClose, user, onSuccess, updateFn }: Props) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    const values = await form.validateFields()
    try {
      setLoading(true)
      const updated = await updateFn(user.id, values)
      message.success('Cập nhật thành công')
      onSuccess(updated)
      onClose()
    } catch {
      message.error('Không thể cập nhật thông tin. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="Chỉnh sửa thông tin"
      open={isOpen}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText="Lưu thay đổi"
      cancelText="Hủy"
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          hoTen: user?.hoTen || '',
          soDienThoai: user?.soDienThoai || '',
          email: user?.email || '',
        }}
        style={{ marginTop: 16 }}
      >
        <Form.Item name="hoTen" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
          <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên" />
        </Form.Item>
        <Form.Item name="soDienThoai" label="Số điện thoại">
          <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Email không hợp lệ' }]}>
          <Input prefix={<MailOutlined />} placeholder="Nhập email" />
        </Form.Item>
      </Form>
    </Modal>
  )
}
