import { useState, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Layout, Menu, Typography, Tooltip } from 'antd'
import {
  HomeOutlined,
  TeamOutlined,
  BankOutlined,
  FileTextOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ToolOutlined,
  UploadOutlined,
  SettingOutlined,
  ApartmentOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { systemTheme } from '@/theme/system-theme'
import { useAuth } from '@/hooks/useAuth'

const { Sider } = Layout
const { Text } = Typography

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  const menuItems = useMemo(() => {
    const items: MenuProps['items'] = [
      { key: '/trang-chu', icon: <HomeOutlined />, label: 'Tổng quan' },
      { key: '/hoc-vien', icon: <TeamOutlined />, label: 'Quản lý học viên' },
      { key: '/phong', icon: <BankOutlined />, label: 'Quản lý ký túc xá' },
      { key: '/thong-ke-hu-hong', icon: <ToolOutlined />, label: 'Thống kê hư hỏng trong KTX' },
      { key: '/van-ban-so-do', icon: <FileTextOutlined />, label: 'Văn bản – sơ đồ - phân công vệ sinh' },
      { key: '/nhap-lieu', icon: <UploadOutlined />, label: 'Quản lý nhập liệu, tra cứu, trích xuất' },
    ]

    const isAdmin = user?.role?.name === 'ADMIN' || user?.roleId === 1
    if (isAdmin) {
      items.push({
        key: 'admin-group',
        icon: <SettingOutlined />,
        label: 'Quản trị hệ thống',
        children: [
          { key: '/admin', label: 'User / Role / Quyền' },
          { key: '/admin/toa-nha-tang', icon: <ApartmentOutlined />, label: 'Tòa nhà & Tầng' },
          { key: '/admin/don-vi', icon: <TeamOutlined />, label: 'Đơn vị đội' },
        ],
      })
    }

    return items
  }, [user])

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key)
  }

  const openKeys = useMemo(() => {
    if (location.pathname.startsWith('/admin')) {
      return ['admin-group']
    }
    return []
  }, [location.pathname])

  return (
    <Sider
      width={320}
      collapsedWidth={64}
      collapsed={collapsed}
      collapsible
      trigger={null}
      style={{
        background: systemTheme.background.container,
        borderRight: `1px solid ${systemTheme.border.subtle}`,
        overflow: 'auto',
        height: 'calc(100vh - 64px)',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={openKeys}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ border: 'none', padding: '8px 4px', flex: 1, background: systemTheme.background.container }}
        />

        {/* Collapse toggle button */}
        <div
          style={{
            borderTop: `1px solid ${systemTheme.border.subtle}`,
            padding: collapsed ? '12px 0' : '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onClick={() => setCollapsed(!collapsed)}
        >
          {!collapsed && (
            <Text type="secondary" style={{ fontSize: 11 }}>Thu gọn</Text>
          )}
          <Tooltip title={collapsed ? 'Mở rộng' : ''} placement="right">
            {collapsed ? (
              <MenuUnfoldOutlined style={{ fontSize: 16, color: systemTheme.text.secondary }} />
            ) : (
              <MenuFoldOutlined style={{ fontSize: 16, color: systemTheme.text.secondary }} />
            )}
          </Tooltip>
        </div>
      </div>
    </Sider>
  )
}
