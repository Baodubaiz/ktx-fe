import { Card, Row, Col, Tag, Spin, Button, Popconfirm, Empty, Tooltip } from 'antd'
import {
  HomeOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  TeamOutlined,
  ManOutlined,
  WomanOutlined
} from '@ant-design/icons'
import type { Room } from '@/types/room'
import { systemTheme } from '@/theme/system-theme'

interface Props {
  data: Room[]
  loading: boolean
  onViewDetail: (item: Room) => void
  onEdit: (item: Room) => void
  onDelete: (id: number) => void
  getRoomStatus?: (room: Room) => 'FULL' | 'AVAILABLE' | 'EMPTY' | 'UNDER_REPAIR'
  occupiedByRoom?: Record<number, number>
}

export default function RoomGrid({ data, loading, onViewDetail, onEdit, onDelete, getRoomStatus, occupiedByRoom = {} }: Props) {
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
        <Empty description="Không có dữ liệu phòng" />
      </div>
    )
  }

  return (
    <div style={{ padding: 16 }}>
      <Row gutter={[16, 16]}>
        {data.map((room) => (
          <Col xs={24} sm={12} md={8} lg={6} key={room.id}>
            <Card
              hoverable
              className="room-grid-item"
              style={{
                height: '100%',
                border: `1px solid ${systemTheme.border.subtle}`,
                transition: 'all 0.3s ease',
              }}
              bodyStyle={{ padding: 16 }}
            >
              <div style={{ marginBottom: 12 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8
                }}>
                  <span style={{
                    fontWeight: 700,
                    fontSize: 16,
                    color: systemTheme.brand.primary,
                    fontFamily: 'monospace',
                  }}>
                    <HomeOutlined style={{ marginRight: 6, fontSize: 14 }} />
                    {room.ma_phong}
                  </span>
                  {room.gioi_tinh_phong === 'NAM' ? (
                    <ManOutlined style={{ fontSize: 18, color: systemTheme.status.success }} />
                  ) : room.gioi_tinh_phong === 'NU' ? (
                    <WomanOutlined style={{ fontSize: 18, color: systemTheme.brand.secondary }} />
                  ) : null}
                </div>

                <div style={{ fontSize: 13, color: systemTheme.text.secondary, marginBottom: 4 }}>
                  <strong>Tòa:</strong> {room.tang?.toaNha?.ten_toa ?? room.tang?.toaNha?.ma_toa ?? 'N/A'}
                </div>

                <div style={{ fontSize: 13, color: systemTheme.text.secondary, marginBottom: 8 }}>
                  <strong>Tầng:</strong> {room.tang?.so_tang != null ? `Tầng ${room.tang.so_tang}` : 'N/A'}
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: 6,
                flexWrap: 'wrap',
                marginBottom: 12
              }}>
                {(() => {
                  const status = getRoomStatus?.(room)
                  if (status === 'FULL') return <Tag color="red">Full</Tag>
                  if (status === 'AVAILABLE') return <Tag color="gold">Còn chỗ</Tag>
                  if (status === 'UNDER_REPAIR') return <Tag color="purple">Đang sửa chữa</Tag>
                  return <Tag color="green">Trống</Tag>
                })()}
                {room.loai_phong && (
                  <Tag
                    color={room.loai_phong === 'HOC_VIEN' ? 'purple' : 'orange'}
                    icon={room.loai_phong === 'HOC_VIEN' ? <TeamOutlined /> : undefined}
                  >
                    {room.loai_phong === 'HOC_VIEN' ? 'Học Viên' : 'Cán Bộ'}
                  </Tag>
                )}
                {room.gioi_tinh_phong && (
                  <Tag color={room.gioi_tinh_phong === 'NAM' ? 'cyan' : 'pink'}>
                    {room.gioi_tinh_phong === 'NAM' ? 'Nam' : 'Nữ'}
                  </Tag>
                )}
                <Tag color="green">
                  {room.giuong?.length ?? 0} giường
                </Tag>
                <Tag color="blue">Đang ở: {occupiedByRoom[room.id] ?? 0}</Tag>
              </div>

              <div style={{
                display: 'flex',
                gap: 6,
                borderTop: `1px solid ${systemTheme.border.subtle}`,
                paddingTop: 12
              }}>
                <Tooltip title="Xem chi tiết">
                  <Button
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => onViewDetail(room)}
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
                    onClick={() => onEdit(room)}
                  />
                </Tooltip>
                <Popconfirm
                  title="Xác nhận xóa phòng này?"
                  description="Hành động này không thể hoàn tác."
                  onConfirm={() => onDelete(room.id)}
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
