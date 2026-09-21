import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Form, Input, Button, Typography, message } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { authService } from '@/services/auth.service'
import { extractErrorMessage } from '@/lib/utils/error.util'


const { Title, Text } = Typography

export default function ChangePassword() {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values: { currentPassword: string; newPassword: string }) => {
    setLoading(true)
    try {
      await authService.changePassword(values.currentPassword, values.newPassword)
      message.success('Đổi mật khẩu thành công')
      form.resetFields()
      await authService.logout()
      navigate('/')
    } catch (error: any) {
      const errorMsg = extractErrorMessage(error) ||
    'Đổi mật khẩu thất bại. Vui lòng thử lại.'
      message.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Title level={3}>Đổi mật khẩu</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        Thay đổi mật khẩu đăng nhập hệ thống
      </Text>

      <Card style={{ maxWidth: 480 }}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="currentPassword"
            label="Mật khẩu hiện tại"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu hiện tại' },
              {
                validator: (_, value) => {
                  if (!value || value.trim().length === 0) {
                    return Promise.reject(new Error('Mật khẩu hiện tại không hợp lệ'))
                  }
                  return Promise.resolve()
                },
              },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu hiện tại" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới' },
              { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' },
              {
              validator: (_, value) => {
                if (/\s/.test(value)) {
                  return Promise.reject(new Error('Mật khẩu không được chứa khoảng trắng'))
                }
                if (value.trim().length < 6) {
                  return Promise.reject(new Error('Mật khẩu tối thiểu 6 ký tự'))
                }
                const current = form.getFieldValue('currentPassword')
                if (current && value === current) {
                  return Promise.reject(
                    new Error('Mật khẩu mới không được trùng mật khẩu cũ')
                  )
                }
                return Promise.resolve()
              },
            },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu mới" />
          </Form.Item>


          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) return Promise.resolve()
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp'))
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu mới" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} disabled={loading} style={{ fontWeight: 700 }}>
              Đổi mật khẩu
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
