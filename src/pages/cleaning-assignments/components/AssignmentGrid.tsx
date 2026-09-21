import { Card, Row, Col, Spin, Button, Popconfirm, Empty, Tooltip } from 'antd'
import { 
  EnvironmentOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  TeamOutlined,
  HomeOutlined,
  CalendarOutlined
} from '@ant-design/icons'
import type { PhanCongVeSinh } from '@/types/cleaning-document'

interface Props {
  data: PhanCongVeSinh[]
  loading: boolean
  onViewDetail: (item: PhanCongVeSinh) => void
  onEdit: (item: PhanCongVeSinh) => void
  onDelete: (id: number) => void
}

export default function AssignmentGrid({ data, loading, onViewDetail, onEdit, onDelete }: Props) {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div style={{ padding: '40px 0' }}>
        <Empty description="Không có dữ liệu phân công" />
      </div>
    )
  }

  return (
    <div style={{ padding: 16 }}>
      <Row gutter={[16, 16]}>
        {data.map((assignment) => (
          <Col xs={24} sm={12} md={8} lg={6} key={assignment.id}>
            <Card
              hoverable
              className="assignment-grid-item"
              style={{
                height: '100%',
                border: '1px solid #f0f0f0',
                transition: 'all 0.3s ease',
              }}
              bodyStyle={{ padding: 16 }}
            >
              <div style={{ marginBottom: 12 }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: 8 
                }}>
                  <EnvironmentOutlined style={{ fontSize: 18, color: '#1890ff', marginRight: 6 }} />
                  <span style={{
                    fontWeight: 700,
                    fontSize: 15,
                    color: '#262626',
                  }}>
                    {assignment.viTri?.ten_vi_tri ?? `Vị trí #${assignment.vi_tri_id}`}
                  </span>
                </div>
                
                <div style={{ fontSize: 13, color: '#595959', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <HomeOutlined style={{ fontSize: 14 }} />
                  <strong>Tòa:</strong> {assignment.viTri?.toaNha?.ten_toa ?? assignment.viTri?.toaNha?.ma_toa ?? 'N/A'}
                </div>
                
                <div style={{ fontSize: 13, color: '#595959', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <TeamOutlined style={{ fontSize: 14 }} />
                  <strong>Trung đội:</strong> {assignment.trungDoi?.ten_don_vi ?? 'Chưa phân công'}
                </div>

                {assignment.thoi_gian && (
                  <div style={{ fontSize: 13, color: '#595959', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CalendarOutlined style={{ fontSize: 14 }} />
                    <strong>Thời gian:</strong> {new Date(assignment.thoi_gian).toLocaleDateString('vi-VN')}
                  </div>
                )}
              </div>

              <div style={{ 
                display: 'flex', 
                gap: 6,
                borderTop: '1px solid #f0f0f0',
                paddingTop: 12
              }}>
                <Tooltip title="Xem chi tiết">
                  <Button
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => onViewDetail(assignment)}
                    style={{ flex: 1 }}
                  >
                    Chi tiết
                  </Button>
                </Tooltip>
                <Tooltip title="Chỉnh sửa">
                  <Button
                    size="small"
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => onEdit(assignment)}
                  />
                </Tooltip>
                <Popconfirm
                  title="Xác nhận xóa phân công này?"
                  description="Hành động này không thể hoàn tác."
                  onConfirm={() => onDelete(assignment.id)}
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                >
                  <Tooltip title="Xóa">
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                    />
                  </Tooltip>
                </Popconfirm>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}
