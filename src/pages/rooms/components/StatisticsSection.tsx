import { Row, Col, Card, Statistic, Table } from 'antd'
import {
  HomeOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  DatabaseOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Room } from '@/types/room'
import { systemTheme } from '@/theme/system-theme'

interface Props {
  rooms: Room[]
  filteredCount: number
  roomStatusSummary?: {
    FULL: number
    AVAILABLE: number
    EMPTY: number
    UNDER_REPAIR: number
  }
  bedStatsFromDb?: {
    tong: number
    dang_su_dung: number
    trong: number
  } | null
}

interface BedStats {
  key: string
  loai: string
  tong_so: number
}

export default function StatisticsSection({
  rooms,
  filteredCount,
  roomStatusSummary,
  bedStatsFromDb,
}: Props) {
  const totalRooms = rooms.length
  const studentRooms = rooms.filter((r) => r.loai_phong === 'HOC_VIEN').length
  const staffRooms = rooms.filter((r) => r.loai_phong === 'CAN_BO').length
  const totalBedsFallback = rooms.reduce((sum, r) => sum + (r.so_giuong || 0), 0)

  let bedsUsedFallback = 0
  let bedsEmptyFallback = 0

  rooms.forEach((room) => {
    const numberOfBeds = room.so_giuong || 0
    const assigned = (room as any).lichSuBoTriPhong?.length || 0
    const usedInRoom = Math.min(Math.max(assigned, 0), numberOfBeds)
    bedsUsedFallback += usedInRoom
    bedsEmptyFallback += Math.max(numberOfBeds - usedInRoom, 0)
  })

  const totalBeds = bedStatsFromDb?.tong ?? totalBedsFallback
  const bedsUsed = bedStatsFromDb?.dang_su_dung ?? bedsUsedFallback
  const bedsEmpty = bedStatsFromDb?.trong ?? bedsEmptyFallback

  const bedStats: BedStats[] = [
    { key: '1', loai: 'Tổng giường', tong_so: totalBeds },
    { key: '2', loai: 'Đang sử dụng', tong_so: bedsUsed },
    { key: '3', loai: 'Còn trống', tong_so: bedsEmpty },
  ]

  const statCardStyle = {
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    borderRadius: 8,
    background: '#fff',
    border: `1px solid ${systemTheme.border.subtle}`,
  }

  const bedColumns: ColumnsType<BedStats> = [
    {
      title: 'Loại giường',
      dataIndex: 'loai',
      key: 'loai',
      align: 'left',
      render: (v) => <span style={{ fontWeight: 600 }}>{v}</span>,
    },
    {
      title: 'Số lượng',
      dataIndex: 'tong_so',
      key: 'tong_so',
      align: 'center',
      width: 100,
      render: (v) => <span style={{ fontWeight: 700, color: systemTheme.brand.primary }}>{v}</span>,
    },
  ]

  return (
    <div style={{ marginBottom: 20 }} className="animate-fade-in">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ ...statCardStyle, borderTop: `3px solid ${systemTheme.brand.primary}` }}>
            <Statistic
              title="Tổng số phòng"
              value={totalRooms}
              prefix={<HomeOutlined style={{ color: systemTheme.brand.primary }} />}
              valueStyle={{ color: systemTheme.brand.primary, fontWeight: 700 }}
            />
            {filteredCount < totalRooms && (
              <div style={{ fontSize: 12, color: systemTheme.text.secondary, marginTop: 8 }}>
                Đang hiển thị: {filteredCount}
              </div>
            )}
            {roomStatusSummary && (
              <div style={{ fontSize: 12, color: systemTheme.text.secondary, marginTop: 8 }}>
                Full: {roomStatusSummary.FULL} • Còn chỗ: {roomStatusSummary.AVAILABLE}
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ ...statCardStyle, borderTop: `3px solid ${systemTheme.status.success}` }}>
            <Statistic
              title="Phòng học viên"
              value={studentRooms}
              prefix={<TeamOutlined style={{ color: systemTheme.status.success }} />}
              valueStyle={{ color: systemTheme.status.success, fontWeight: 700 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ ...statCardStyle, borderTop: `3px solid ${systemTheme.brand.secondary}` }}>
            <Statistic
              title="Phòng cán bộ"
              value={staffRooms}
              prefix={<CheckCircleOutlined style={{ color: systemTheme.brand.secondary }} />}
              valueStyle={{ color: systemTheme.brand.secondary, fontWeight: 700 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ ...statCardStyle, borderTop: `3px solid ${systemTheme.brand.accent}` }}>
            <Statistic
              title="Tổng giường"
              value={totalBeds}
              prefix={<DatabaseOutlined style={{ color: systemTheme.brand.accent }} />}
              valueStyle={{ color: systemTheme.brand.accent, fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card
            title="Thống kê giường"
            size="small"
            style={{ background: systemTheme.background.subtle, borderColor: systemTheme.border.subtle }}
          >
            <Table columns={bedColumns} dataSource={bedStats} pagination={false} size="small" bordered={false} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
