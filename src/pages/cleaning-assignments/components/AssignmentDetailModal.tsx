import { Modal, Descriptions, Tag } from 'antd'
import { EnvironmentOutlined, HomeOutlined, TeamOutlined, CalendarOutlined } from '@ant-design/icons'
import type { PhanCongVeSinh } from '@/types/cleaning-document'

interface Props {
  assignment: PhanCongVeSinh | null
  onClose: () => void
}

export default function AssignmentDetailModal({ assignment, onClose }: Props) {
  if (!assignment) return null

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <EnvironmentOutlined style={{ color: '#1890ff' }} />
          <span>Chi tiết phân công vệ sinh</span>
        </div>
      }
      open={!!assignment}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Descriptions 
        bordered 
        column={2} 
        size="small"
        style={{ marginTop: 16 }}
      >
        <Descriptions.Item label="ID" span={1}>
          <code style={{ 
            background: '#fafafa', 
            padding: '2px 6px', 
            borderRadius: 3,
            fontSize: 12
          }}>
            #{assignment.id}
          </code>
        </Descriptions.Item>

        <Descriptions.Item label="Vị trí ID" span={1}>
          <code style={{ 
            background: '#fafafa', 
            padding: '2px 6px', 
            borderRadius: 3,
            fontSize: 12
          }}>
            #{assignment.vi_tri_id}
          </code>
        </Descriptions.Item>

        <Descriptions.Item label="Vị trí" span={2}>
          <span style={{
            fontWeight: 700,
            fontSize: 14,
            color: '#1d4ed8',
          }}>
            {assignment.viTri?.ten_vi_tri ?? `Vị trí #${assignment.vi_tri_id}`}
          </span>
        </Descriptions.Item>

        <Descriptions.Item label="Tòa nhà" span={1}>
          <Tag color="blue" icon={<HomeOutlined />} style={{ fontSize: 13 }}>
            {assignment.viTri?.toaNha?.ten_toa ?? assignment.viTri?.toaNha?.ma_toa ?? 'N/A'}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Mã tòa" span={1}>
          {assignment.viTri?.toaNha?.ma_toa ?? 'N/A'}
        </Descriptions.Item>

        <Descriptions.Item label="Trung đội phụ trách" span={2}>
          <Tag color="purple" icon={<TeamOutlined />} style={{ fontSize: 13 }}>
            {assignment.trungDoi?.ten_don_vi ?? assignment.trungDoi?.ma_don_vi ?? 'Chưa phân công'}
          </Tag>
        </Descriptions.Item>

        {assignment.trungDoi?.ma_don_vi && (
          <Descriptions.Item label="Mã đơn vị" span={1}>
            {assignment.trungDoi.ma_don_vi}
          </Descriptions.Item>
        )}

        {assignment.trungDoi?.id && (
          <Descriptions.Item label="ID Trung đội" span={1}>
            <code style={{ 
              background: '#fafafa', 
              padding: '2px 6px', 
              borderRadius: 3,
              fontSize: 12
            }}>
              #{assignment.trungDoi.id}
            </code>
          </Descriptions.Item>
        )}

        <Descriptions.Item label="Thời gian phân công" span={2}>
          <Tag color="orange" icon={<CalendarOutlined />} style={{ fontSize: 13 }}>
            {assignment.thoi_gian 
              ? new Date(assignment.thoi_gian).toLocaleDateString('vi-VN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })
              : 'Chưa xác định'}
          </Tag>
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  )
}
