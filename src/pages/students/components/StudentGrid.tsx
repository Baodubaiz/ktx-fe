import { Row, Col, Card, Tag, Button, Space, Popconfirm, Avatar, Typography, Empty, Spin } from 'antd'

import { EditOutlined, DeleteOutlined, UserOutlined, CalendarOutlined, HomeOutlined } from '@ant-design/icons'

import { formatDate } from '@/lib/utils'
import { systemTheme } from '@/theme/system-theme'

const { Text, Title } = Typography

interface Props {
  data: any[]
  loading: boolean
  onViewDetail: (item: any) => void
  onEdit: (item: any) => void
  onDelete: (id: number) => void
}

export default function StudentGrid({ data, loading, onViewDetail, onEdit, onDelete }: Props) {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: 40 }}>
        <Empty description="Không có dữ liệu học viên" />
      </div>
    )
  }

  return (
    <Row gutter={[16, 16]} style={{ padding: 16 }} className="animate-fade-in">
      {data.map((student) => (
        <Col xs={24} sm={12} lg={8} xl={6} key={student.id}>
          <Card
            hoverable
            onClick={() => onViewDetail(student)}
            style={{
              borderRadius: 8,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              border: `1px solid ${systemTheme.border.subtle}`,
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
            styles={{
              body: { padding: 16 }
            }}
            actions={[
              <Button
                key="edit"
                type="text"
                icon={<EditOutlined />}
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(student)
                }}
              >
                Sửa
              </Button>,
              <Popconfirm
                key="delete"
                title="Xác nhận xóa học viên?"
                onConfirm={(e) => {
                  e?.stopPropagation()
                  onDelete(student.id)
                }}
                onCancel={(e) => e?.stopPropagation()}
              >
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={(e) => e.stopPropagation()}
                >
                  Xóa
                </Button>
              </Popconfirm>,
            ]}
          >
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <Avatar
                size={64}
                icon={<UserOutlined />}
                style={{
                  background: student.gioi_tinh === 'NAM' ? systemTheme.brand.primary : systemTheme.brand.secondary,
                  marginBottom: 8,
                }}
              >
                {student.ho_ten?.charAt(0) || 'U'}
              </Avatar>
              <Title level={5} style={{ margin: '8px 0 4px', fontSize: 16 }}>
                {student.ho_ten || 'N/A'}
              </Title>
              <Text
                strong
                style={{
                  fontFamily: 'monospace',
                  color: systemTheme.brand.primary,
                  fontSize: 13,
                }}
              >
                {student.ma_hoc_vien}
              </Text>
            </div>

            <div style={{ marginTop: 12 }}>
              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CalendarOutlined style={{ color: systemTheme.text.secondary }} />

                  <Text style={{ fontSize: 13 }}>
                    {formatDate(student.ngay_sinh) || 'N/A'}
                  </Text>
                </div >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <HomeOutlined style={{ color: systemTheme.text.secondary }} />
                  <Text ellipsis style={{ fontSize: 13 }}>
                    {student.que_quan || 'Chưa cập nhật'}
                  </Text>
                </div>
              </Space >
            </div >

            <div style={{ marginTop: 12, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {student.gioi_tinh && (
                <Tag color={student.gioi_tinh === 'NAM' ? 'blue' : 'pink'}>
                  {student.gioi_tinh}
                </Tag>
              )}
              {student.dan_toc && (
                <Tag color="default">{student.dan_toc}</Tag>
              )}
              {student.cam_tinh_dang && (
                <Tag color="red">Đảng viên</Tag>
              )}
            </div>
          </Card >
        </Col >
      ))
      }
    </Row >
  )
}
