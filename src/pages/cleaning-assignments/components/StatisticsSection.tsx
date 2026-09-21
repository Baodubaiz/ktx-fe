import { Row, Col, Card, Statistic, Progress } from 'antd'
import { 
  ScheduleOutlined, 
  HomeOutlined, 
  TeamOutlined, 
  CalendarOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import type { PhanCongVeSinh } from '@/types/cleaning-document'

interface Props {
  assignments: PhanCongVeSinh[]
  filteredCount: number
}

export default function StatisticsSection({ assignments, filteredCount }: Props) {
  const totalAssignments = assignments.length
  
  // Group by building
  const byBuilding = assignments.reduce((acc, a) => {
    const buildingName = a.viTri?.toaNha?.ten_toa ?? 'Khác'
    acc[buildingName] = (acc[buildingName] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const topBuilding = Object.entries(byBuilding).sort((a, b) => b[1] - a[1])[0]
  
  // Group by squad
  const bySquad = assignments.reduce((acc, a) => {
    const squadName = a.trungDoi?.ten_don_vi ?? 'Chưa phân công'
    acc[squadName] = (acc[squadName] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const topSquad = Object.entries(bySquad).sort((a, b) => b[1] - a[1])[0]
  
  // This month
  const thisMonth = assignments.filter(a => {
    if (!a.thoi_gian) return false
    return dayjs(a.thoi_gian).isSame(dayjs(), 'month')
  }).length
  const thisMonthPercentage = totalAssignments > 0 ? Math.round((thisMonth / totalAssignments) * 100) : 0

  const statCardStyle = {
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    borderRadius: 8,
    background: '#fff',
    border: '1px solid #f0f0f0',
  }

  return (
    <div style={{ marginBottom: 20 }} className="animate-fade-in">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={{ ...statCardStyle, borderTop: '3px solid #1890ff' }}
          >
            <Statistic
              title="Tổng phân công"
              value={totalAssignments}
              prefix={<ScheduleOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff', fontWeight: 700 }}
            />
            {filteredCount < totalAssignments && (
              <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 8 }}>
                Đang hiển thị: {filteredCount}
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={{ ...statCardStyle, borderTop: '3px solid #52c41a' }}
          >
            <Statistic
              title="Tòa có nhiều nhất"
              value={topBuilding?.[1] ?? 0}
              prefix={<HomeOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontWeight: 700 }}
            />
            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 8 }}>
              {topBuilding?.[0] ?? 'Chưa có dữ liệu'}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={{ ...statCardStyle, borderTop: '3px solid #722ed1' }}
          >
            <Statistic
              title="Trung đội nhiều nhất"
              value={topSquad?.[1] ?? 0}
              prefix={<TeamOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1', fontWeight: 700 }}
            />
            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 8 }}>
              {topSquad?.[0] ?? 'Chưa có dữ liệu'}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={{ ...statCardStyle, borderTop: '3px solid #fa8c16' }}
          >
            <Statistic
              title="Phân công tháng này"
              value={thisMonth}
              prefix={<CalendarOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16', fontWeight: 700 }}
            />
            <Progress
              percent={thisMonthPercentage}
              strokeColor="#fa8c16"
              showInfo={true}
              size="small"
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
