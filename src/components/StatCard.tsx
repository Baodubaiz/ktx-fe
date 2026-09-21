import { Card } from 'antd'
import type { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: number | string
  icon: ReactNode
  color: string
  /** Optional suffix like "phòng", "người" */
  suffix?: string
  /** Optional trend percentage */
  trend?: number
  /** Optional click handler for navigation */
  onClick?: () => void
}

/**
 * Dashboard stat card with colorful icon badge
 */
export default function StatCard({ title, value, icon, color, suffix, onClick }: StatCardProps) {
  return (
    <Card
      hoverable
      onClick={onClick}
      style={{ borderRadius: 12, border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', cursor: onClick ? 'pointer' : undefined }}
      styles={{ body: { padding: '20px 24px' } }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            background: `${color}14`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            color,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, color: '#8c8c8c', fontWeight: 500, marginBottom: 4 }}>{title}</div>
          <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2, color: '#1f2937' }}>
            {typeof value === 'number' ? value.toLocaleString('vi-VN') : value}
            {suffix && <span style={{ fontSize: 14, fontWeight: 400, color: '#8c8c8c', marginLeft: 4 }}>{suffix}</span>}
          </div>
        </div>
      </div>
    </Card>
  )
}
