import { Button, Space, Typography } from 'antd'
import { CheckCircleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { PROJECT_SYSTEM_TITLE } from '@/constants/project'
import './login.css'

const { Title, Text } = Typography

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="landing-hero">
      <div className="landing-bg-motion" />
      <div className="landing-shade" />
      <div className="landing-spike-overlay" />

      <div className="landing-content">
        <div className="landing-marquee-container">
          <div className="landing-marquee-content">
            PHẦN MỀM QUẢN LÝ KÝ TÚC XÁ HỌC VIÊN TẠI TRƯỜNG ĐẠI HỌC CẢNH SÁT NHÂN DÂN
          </div>
        </div>

        <Title className="landing-title" level={1}>
          Kỷ luật - Trách nhiệm - Hiệu quả
        </Title>

        <Text className="landing-subtitle">
          {PROJECT_SYSTEM_TITLE}
        </Text>

        <Space direction="vertical" size={10} className="landing-bullets">
          <Text className="landing-bullet"><CheckCircleOutlined /> Phân quyền quản lý sử dụng theo chức năng</Text>
          <Text className="landing-bullet"><CheckCircleOutlined /> Theo dõi phân công phòng ở, quản lý cơ sở vật chất và lịch sử vận hành</Text>
          <Text className="landing-bullet"><CheckCircleOutlined /> Trích lọc báo cáo theo yêu cầu</Text>
        </Space>

        <Space size={12} wrap style={{ marginTop: 16 }}>
          <Button type="primary" size="large" onClick={() => navigate('/login')} className="landing-cta">
            Bắt đầu
          </Button>
          <Button size="large" className="landing-hotline">Hotline: 1900.999</Button>
        </Space>

        <Text className="landing-note">Sẵn sàng vận hành từ trang đăng nhập</Text>
      </div>
    </div>
  )
}
