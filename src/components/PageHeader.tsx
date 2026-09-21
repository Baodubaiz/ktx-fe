import { Typography, Breadcrumb, Space } from 'antd'
import { HomeOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { systemTheme } from '@/theme/system-theme'

const { Title, Text } = Typography

interface BreadcrumbItem {
  label: string
  path?: string
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumbs?: BreadcrumbItem[]
  extra?: ReactNode
}

export default function PageHeader({ title, subtitle, breadcrumbs, extra }: PageHeaderProps) {
  const breadcrumbItems = [
    {
      title: (
        <Link to="/trang-chu" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <HomeOutlined />
          <span>Trang chủ</span>
        </Link>
      ),
    },
    ...(breadcrumbs ?? []).map((item) => ({
      title: item.path ? <Link to={item.path}>{item.label}</Link> : item.label,
    })),
  ]

  return (
    <div style={{ marginBottom: 20 }}>
      <Breadcrumb items={breadcrumbItems} style={{ marginBottom: 10 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0, lineHeight: 1.25, color: systemTheme.text.primary }}>{title}</Title>
          {subtitle && (
            <Text type="secondary" style={{ fontSize: 13, marginTop: 4, display: 'block', maxWidth: 860 }}>{subtitle}</Text>
          )}
        </div>
        {extra && <Space wrap>{extra}</Space>}
      </div>
    </div>
  )
}
