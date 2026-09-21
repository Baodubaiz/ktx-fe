import { useEffect, useMemo, useState } from 'react'
import { Button, Card, Col, Divider, Row, Space, Spin, Table, Typography, message } from 'antd'
import {
  BankOutlined,
  FileTextOutlined,
  HomeOutlined,
  TeamOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'
import { PageContainer } from '@/components'
import { useAuth } from '@/hooks/useAuth'
import {
  thongKeService,
  type ThongKeTheoCoSo,
  type TongQuanThongKeResponse,
} from '@/services/thong-ke.service'
import { systemTheme } from '@/theme/system-theme'
import { PROJECT_OPERATION_TITLE } from '@/constants/project'

const { Title, Text } = Typography

const EMPTY_STATS: TongQuanThongKeResponse = {
  tong_co_so_unique: 0,
  tong_toa_nha: 0,
  tong_phong: 0,
  tong_hoc_vien: 0,
  thong_ke_theo_co_so: [],
}

const statCardBaseStyle: React.CSSProperties = {
  borderRadius: systemTheme.radius.lg,
  border: `1px solid ${systemTheme.border.subtle}`,
  boxShadow: systemTheme.shadow.card,
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<TongQuanThongKeResponse>(EMPTY_STATS)

  const displayName = user?.hoTen || user?.username || user?.maQuanHam || 'Người dùng'

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const result = await thongKeService.getTongQuan()
        setStats(result)
      } catch {
        message.error('Không tải được dữ liệu tổng quan')
        setStats(EMPTY_STATS)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const tableColumns = useMemo<ColumnsType<ThongKeTheoCoSo>>(
    () => [
      { title: 'Cơ sở', dataIndex: 'co_so', key: 'co_so' },
      { title: 'Tòa nhà', dataIndex: 'tong_toa_nha', key: 'tong_toa_nha', align: 'right' },
      { title: 'Tầng', dataIndex: 'tong_tang', key: 'tong_tang', align: 'right' },
      { title: 'Phòng', dataIndex: 'tong_phong', key: 'tong_phong', align: 'right' },
      {
        title: 'Học viên đang ở',
        dataIndex: 'tong_hoc_vien',
        key: 'tong_hoc_vien',
        align: 'right',
      },
    ],
    [],
  )

  if (loading) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: 80 }}>
          <Spin size="large" />
          <div style={{ marginTop: 12 }}>Đang tải dữ liệu tổng quan...</div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <Card
        style={{
          marginBottom: 16,
          borderRadius: systemTheme.radius.xl,
          overflow: 'hidden',
          border: 'none',
          boxShadow: systemTheme.shadow.soft,
        }}
        styles={{ body: { padding: 0 } }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #5D7A45 0%, #2F6F88 100%)',
            color: systemTheme.text.onPrimary,
            padding: '20px 24px',
          }}
        >
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, letterSpacing: 0.6 }}>
            {PROJECT_OPERATION_TITLE}
          </Text>
          <Title level={3} style={{ color: '#fff', margin: '4px 0 6px' }}>
            Xin chào, {displayName}
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.86)' }}>
            Tổng hợp nhanh theo cơ sở, tòa nhà, phòng và học viên.
          </Text>
        </div>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={statCardBaseStyle}>
            <Space align="start" style={{ width: '100%', justifyContent: 'space-between' }}>
              <div>
                <Text type="secondary">Tổng cơ sở</Text>
                <Title level={2} style={{ margin: '6px 0 0', color: systemTheme.brand.primary }}>
                  {stats.tong_co_so_unique.toLocaleString('vi-VN')}
                </Title>
              </div>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: systemTheme.brand.primarySoft,
                color: systemTheme.brand.primary,
              }}>
                <BankOutlined />
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card style={statCardBaseStyle}>
            <Space align="start" style={{ width: '100%', justifyContent: 'space-between' }}>
              <div>
                <Text type="secondary">Tổng tòa nhà</Text>
                <Title level={2} style={{ margin: '6px 0 0', color: systemTheme.brand.secondary }}>
                  {stats.tong_toa_nha.toLocaleString('vi-VN')}
                </Title>
              </div>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: systemTheme.brand.secondarySoft,
                color: systemTheme.brand.secondary,
              }}>
                <HomeOutlined />
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card style={statCardBaseStyle}>
            <Space align="start" style={{ width: '100%', justifyContent: 'space-between' }}>
              <div>
                <Text type="secondary">Tổng phòng</Text>
                <Title level={2} style={{ margin: '6px 0 0', color: systemTheme.brand.accent }}>
                  {stats.tong_phong.toLocaleString('vi-VN')}
                </Title>
              </div>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: systemTheme.brand.accentSoft,
                color: systemTheme.brand.accent,
              }}>
                <FileTextOutlined />
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card style={statCardBaseStyle}>
            <Space align="start" style={{ width: '100%', justifyContent: 'space-between' }}>
              <div>
                <Text type="secondary">Tổng học viên</Text>
                <Title level={2} style={{ margin: '6px 0 0', color: systemTheme.status.info }}>
                  {stats.tong_hoc_vien.toLocaleString('vi-VN')}
                </Title>
              </div>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#E6F0FA',
                color: systemTheme.status.info,
              }}>
                <TeamOutlined />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card
        style={{ ...statCardBaseStyle, marginBottom: 16 }}
        styles={{ body: { padding: '14px 16px' } }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size={10}>
          <Text strong style={{ color: systemTheme.text.primary }}>Thao tác nhanh</Text>
          <Divider style={{ margin: 0 }} />
          <Row gutter={[12, 12]}>
            <Col xs={12} sm={6}>
              <Button block icon={<TeamOutlined />} onClick={() => navigate('/hoc-vien')}>
                Quản lý học viên
              </Button>
            </Col>
            <Col xs={12} sm={6}>
              <Button block icon={<HomeOutlined />} onClick={() => navigate('/phong')}>
                Quản lý ký túc xá
              </Button>
            </Col>
            <Col xs={12} sm={6}>
              <Button block icon={<FileTextOutlined />} onClick={() => navigate('/van-ban-so-do')}>
                Văn bản – sơ đồ - phân công vệ sinh
              </Button>
            </Col>
            <Col xs={12} sm={6}>
              <Button block icon={<UploadOutlined />} onClick={() => navigate('/nhap-lieu')}>
                Quản lý nhập liệu, tra cứu, trích xuất
              </Button>
            </Col>
          </Row>
        </Space>
      </Card>

      <Card
        title={<Text strong>Thống kê theo cơ sở</Text>}
        style={statCardBaseStyle}
        styles={{ header: { borderBottom: `1px solid ${systemTheme.border.subtle}` } }}
      >
        <Table<ThongKeTheoCoSo>
          rowKey={(record) => record.co_so}
          columns={tableColumns}
          dataSource={stats.thong_ke_theo_co_so}
          pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }}
          locale={{ emptyText: 'Chưa có dữ liệu theo cơ sở' }}
          summary={() => {
            const totalToa = stats.thong_ke_theo_co_so.reduce((sum, item) => sum + item.tong_toa_nha, 0)
            const totalTang = stats.thong_ke_theo_co_so.reduce((sum, item) => sum + item.tong_tang, 0)
            const totalPhong = stats.thong_ke_theo_co_so.reduce((sum, item) => sum + item.tong_phong, 0)
            const totalHocVien = stats.thong_ke_theo_co_so.reduce((sum, item) => sum + item.tong_hoc_vien, 0)

            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}><strong>Tổng</strong></Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right"><strong>{totalToa}</strong></Table.Summary.Cell>
                <Table.Summary.Cell index={2} align="right"><strong>{totalTang}</strong></Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="right"><strong>{totalPhong}</strong></Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="right"><strong>{totalHocVien}</strong></Table.Summary.Cell>
              </Table.Summary.Row>
            )
          }}
        />
      </Card>
    </PageContainer>
  )
}
