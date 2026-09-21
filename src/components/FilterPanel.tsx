import { Card, Space } from 'antd'
import type { ReactNode } from 'react'
import { systemTheme } from '@/theme/system-theme'

interface FilterPanelProps {
  children: ReactNode
  /** Title of the filter card */
  title?: ReactNode
  /** Width in px. Default: 256 */
  width?: number
  /** Footer element, e.g. reset button */
  footer?: ReactNode
}

/**
 * Consistent Filter Sidebar used across CRUD pages
 */
export default function FilterPanel({
  children,
  title = 'Bộ lọc',
  width = 256,
  footer,
}: FilterPanelProps) {
  return (
    <Card
      className="qlktx-filter-panel"
      title={title}
      size="small"
      style={{
        width,
        flexShrink: 0,
        alignSelf: 'flex-start',
        position: 'sticky',
        top: 0,
        borderColor: systemTheme.border.subtle,
      }}
      styles={{
        header: { fontSize: 13, fontWeight: 700 },
        body: { padding: '12px 16px' },
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size={14}>
        {children}
      </Space>
      {footer && <div style={{ marginTop: 16 }}>{footer}</div>}
    </Card>
  )
}

/** Reusable label for filter fields */
export function FilterLabel({ children }: { children: ReactNode }) {
  return <div className="qlktx-filter-label">{children}</div>
}
