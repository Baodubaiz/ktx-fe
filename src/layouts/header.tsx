import { Layout, Dropdown, Badge, Avatar, Space, Typography } from 'antd'
import {
  BellOutlined,
  UserOutlined,
  LockOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { MenuProps } from 'antd'
import { PROJECT_SHORT_NAME, PROJECT_SYSTEM_TITLE } from '@/constants/project'
import './header.css'

const { Text } = Typography

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const displayName = user?.username || user?.maQuanHam || 'Người dùng'
  const displayRole = user?.role?.description || user?.role?.name || 'Cán bộ'

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const menuItems: MenuProps['items'] = [
    {
      key: 'profile-header',
      label: (
        <div style={{ padding: '8px 0' }}>
          <Text strong>{displayName}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{displayRole}</Text>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Hồ sơ cá nhân',
      onClick: () => navigate('/nguoi-dung'),
    },
    {
      key: 'change-password',
      icon: <LockOutlined />,
      label: 'Đổi mật khẩu',
      onClick: () => navigate('/doi-mat-khau'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
      onClick: handleLogout,
    },
  ]

  return (
    <Layout.Header className="glass-header">
      {/* Animated Background Pattern */}
      <div className="header-animated-overlay" />

      {/* LEFT: Logo + System Name */}
      <div className="header-logo-container" onClick={() => navigate('/trang-chu')}>
        <div className="header-logo-box">
          <img
            src="/images/logo_ktx-removebg.png"
            alt="Logo"
            className="header-logo-img"
          />
        </div>
        <div style={{ lineHeight: 1.4 }}>
          <Text className="header-title">{PROJECT_SHORT_NAME}</Text>
          <Text className="header-subtitle">{PROJECT_SYSTEM_TITLE}</Text>
          <Text className="header-subtitle" style={{ fontSize: 11, fontStyle: 'italic' }}>
            People's Police University
          </Text>
        </div>
      </div>

      {/* MIDDLE: Scrolling Text Marquee */}
      <div className="header-marquee-container">
        <div className="header-marquee-content">
          TRƯỜNG ĐẠI HỌC CẢNH SÁT NHÂN DÂN — KỶ LUẬT, TRÁCH NHIỆM, HIỆU QUẢ
        </div>
      </div>

      {/* RIGHT: Notification + User Dropdown */}
      <Space size={24} align="center" className="header-actions">
        <Badge count={0} size="small">
          <div className="header-notification-btn">
            <BellOutlined style={{ color: '#fff', fontSize: 19, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }} />
          </div>
        </Badge>

        <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={['click']}>
          <Space className="header-user-dropdown">
            <div style={{ textAlign: 'right', lineHeight: '15px' }}>
              <Text className="header-user-name">{displayName}</Text>
              <Text className="header-user-role">{displayRole}</Text>
            </div>
            <Avatar size={34} className="header-user-avatar" icon={<UserOutlined />}>
              {displayName?.charAt(displayName.lastIndexOf(' ') + 1) || 'U'}
            </Avatar>
          </Space>
        </Dropdown>
      </Space>
    </Layout.Header>
  )
}
