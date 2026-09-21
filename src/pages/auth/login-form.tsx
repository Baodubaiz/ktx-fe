import { Form, Input, Button, Typography, Card } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useLogin } from '@/hooks/useLogin'
import { PROJECT_SHORT_NAME, PROJECT_SYSTEM_TITLE } from '@/constants/project'
import { systemTheme } from '@/theme/system-theme'
import '../login.css'

const { Title, Text, Link } = Typography

interface LoginFormValues {
  username: string
  password: string
}

export default function LoginFormPage() {
  const { login, loading, error } = useLogin()
  const [form] = Form.useForm()

  const handleSubmit = (values: LoginFormValues) => {
    login(values)
  }

  return (
    <div className="login-container">
      <div className="landing-bg-motion" />
      <div className="mesh-gradient-orb mesh-orb-1" />
      <div className="mesh-gradient-orb mesh-orb-2" />
      <div className="mesh-gradient-orb mesh-orb-3" />
      <div className="mesh-gradient-orb mesh-orb-4" />
      <div className="mesh-gradient-orb mesh-orb-5" />

      <Card className="login-card" styles={{ body: { padding: '52px 40px 40px', position: 'relative', zIndex: 1 } }}>
        <div className="login-accent-bar" />

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div className="login-logo">
            <div className="header-logo-container">
              <div className="header-logo-box">
                <img
                  src="/images/logo_ktx-removebg.png"
                  alt="Logo"
                  className="login-logo-img"
                />
              </div>
            </div>
          </div>
          <Title level={3} className="login-title" style={{ fontSize: 26, marginBottom: 8 }}>
            {PROJECT_SHORT_NAME}
          </Title>
          <Text style={{ fontSize: 14, color: systemTheme.text.secondary, display: 'block', fontWeight: 500 }}>
            Đăng nhập vào hệ thống quản lý
          </Text>
        </div>

        <Form form={form} onFinish={handleSubmit} layout="vertical" size="large">
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập mã quân hàm' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: systemTheme.text.muted, fontSize: 16 }} />}
              placeholder="Mã quân hàm"
              disabled={loading}
              className="login-input"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: systemTheme.text.muted, fontSize: 16 }} />}
              placeholder="Mật khẩu"
              disabled={loading}
              className="login-input"
            />
          </Form.Item>

          {error && (
            <div className="login-error">
              <Text type="danger" style={{ fontSize: 14, fontWeight: 600 }}>{error}</Text>
            </div>
          )}

          <Form.Item style={{ marginBottom: 16, marginTop: 8 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={loading}
              block
              className="login-button"
            >
              {loading ? 'Đang đăng nhập...' : 'ĐĂNG NHẬP'}
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Link
              onClick={() => alert('Liên hệ quản trị viên để cấp lại mật khẩu')}
              className="login-forgot-link"
            >
              Quên mật khẩu?
            </Link>
          </div>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 36, paddingTop: 24, borderTop: `1px solid ${systemTheme.border.subtle}` }}>
          <Text style={{ fontSize: 12, color: systemTheme.text.muted, fontWeight: 500 }}>
            © 2026 {PROJECT_SYSTEM_TITLE}
          </Text>
        </div>
      </Card>
    </div>
  )
}
