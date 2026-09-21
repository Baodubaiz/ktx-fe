import { useState, useEffect } from 'react'
import { Card, Typography, Button, Avatar, Tag, Descriptions, Space, Spin, Row, Col } from 'antd'
import {
  EditOutlined, LockOutlined, PhoneOutlined,
  MailOutlined, IdcardOutlined, BankOutlined, BookOutlined,
  CheckCircleOutlined, CloseCircleOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { PageContainer } from '@/components'
import { colors } from '@/theme/colors'
import { userService } from '@/services/user.service'
import EditProfileModal from './update-profile'
import { useUser } from '@/hooks/useUser'

const { Title, Text } = Typography

export default function Profile() {
  const { user, loading, refresh } = useUser()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const navigate = useNavigate()
  useEffect(() => {
  }, [user])

  if (loading && !user) {
    return (
      <div style={{ height: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    )
  }

  const displayName = user?.hoTen || user?.maQuanHam || 'Người dùng'
  const displayRole = user?.role?.description || 'Cán bộ'

  return (
    <PageContainer>
      {/* Banner */}
      <div
        style={{
          background: colors.primary.DEFAULT,
          borderRadius: 12,
          padding: '32px 40px',
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <Title level={3} style={{ color: '#fff', margin: 0 }}>Thông tin cá nhân</Title>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', marginTop: 8, display: 'block' }}>
            Quản lý tài khoản hệ thống
          </Text>
        </div>
        <Space>
          <Button icon={<EditOutlined />} onClick={() => setIsEditModalOpen(true)}>
            Chỉnh sửa thông tin
          </Button>
          <Button
            ghost
            icon={<LockOutlined />}
            style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }}
            onClick={() => navigate('/doi-mat-khau')}
          >
            Đổi mật khẩu
          </Button>
        </Space>
      </div>

      {/* Identity card */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Avatar
            size={80}
            style={{ backgroundColor: '#BCAaa4', color: '#5D4037', fontSize: 32, fontWeight: 800 }}
          >
            {displayName.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <Title level={3} style={{ margin: 0 }}>{displayName}</Title>
            <Text type="secondary" style={{ fontSize: 16 }}>{displayRole}</Text>
          </div>
        </div>
      </Card>

      {/* Details */}
      <Card title="Thông tin chi tiết" style={{ marginBottom: 16 }}>
        <Descriptions column={{ xs: 1, md: 2 }} labelStyle={{ fontWeight: 600 }}>
          <Descriptions.Item label={<><IdcardOutlined /> Mã đăng nhập</>}>
            {user?.maQuanHam || '---'}
          </Descriptions.Item>
          <Descriptions.Item label={<><MailOutlined /> Địa chỉ email</>}>
            {user?.email || '---'}
          </Descriptions.Item>
          <Descriptions.Item label={<><PhoneOutlined /> Số điện thoại</>}>
            {user?.soDienThoai || '---'}
          </Descriptions.Item>
          <Descriptions.Item label={<><CheckCircleOutlined /> Trạng thái tài khoản</>}>
            {user?.isActive !== false
              ? <Tag color="success" icon={<CheckCircleOutlined />}>Đang hoạt động</Tag>
              : <Tag color="error" icon={<CloseCircleOutlined />}>Bị khóa</Tag>
            }
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Scope of management */}
      <Card title="Phạm vi quản lý">
        <Row gutter={[32, 16]}>
          <Col xs={24} md={12}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <Avatar icon={<BankOutlined />} style={{ backgroundColor: colors.primary.DEFAULT, flexShrink: 0 }} />
              <div>
                <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Đơn vị phụ trách
                </Text>
                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {(user?.donViDoiChuNhiem?.length ?? 0) > 0
                    ? user!.donViDoiChuNhiem!.map((item: any) => <Tag key={item.id}>{item.ten_don_vi}</Tag>)
                    : <Text type="secondary" italic>Không có dữ liệu</Text>
                  }
                </div>
              </div>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <Avatar icon={<BookOutlined />} style={{ backgroundColor: colors.primary.DEFAULT, flexShrink: 0 }} />
              <div>
                <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Lớp chủ nhiệm
                </Text>
                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {(user?.lopHocChuNhiem?.length ?? 0) > 0
                    ? user!.lopHocChuNhiem!.map((item: any) => <Tag key={item.id}>{item.ten_lop}</Tag>)
                    : <Text type="secondary" italic>Không có dữ liệu</Text>
                  }
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {isEditModalOpen && user && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={user}
          onSuccess={() => refresh()}
          updateFn={userService.updateProfile.bind(userService)}
        />
      )}
    </PageContainer>
  )
}
