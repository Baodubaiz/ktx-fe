import { Outlet, Navigate } from 'react-router-dom'
import { Layout, Spin } from 'antd'
import { useAuth } from '@/hooks/useAuth'
import Header from '@/layouts/header'
import Sidebar from '@/layouts/sidebar'
import { systemTheme } from '@/theme/system-theme'

const { Content } = Layout

export default function MainLayout() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${systemTheme.background.page} 0%, ${systemTheme.brand.primarySoft} 100%)`,
        flexDirection: 'column',
        gap: 16,
      }}>
        <Spin size="large" />
        <span style={{ color: systemTheme.text.secondary, fontSize: 13 }}>Đang khởi tạo hệ thống...</span>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Layout>
        <Sidebar />
        <Content
          className="main-content-bg"
          style={{
            padding: 0,
            overflow: 'auto',
            minHeight: 'calc(100vh - 64px)',
            transition: 'all 0.2s ease',
          }}
        >
          <div
            className="main-content-overlay"
            style={{
              minHeight: 'calc(100vh - 64px)',
              padding: 24,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}