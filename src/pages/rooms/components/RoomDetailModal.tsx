import { Modal, Descriptions, Tag, Typography, Table, Divider } from 'antd'
import { HomeOutlined, TeamOutlined, ManOutlined, WomanOutlined } from '@ant-design/icons'
import { useEffect, useMemo, useState } from 'react'
import type { Room } from '@/types/room'
import { roomService } from '@/services/room.service'

const { Text } = Typography

interface Props {
  room: Room | null
  onClose: () => void
}

export default function RoomDetailModal({ room, onClose }: Props) {
  const [detailRoom, setDetailRoom] = useState<Room | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const displayRoom = detailRoom ?? room

  useEffect(() => {
    const roomId = room?.id
    if (!roomId) {
      setDetailRoom(null)
      return
    }

    let mounted = true
    setLoadingDetail(true)
    roomService
      .getById(roomId)
      .then((data) => {
        if (mounted) setDetailRoom(data)
      })
      .catch(() => {
        if (mounted) setDetailRoom(room)
      })
      .finally(() => {
        if (mounted) setLoadingDetail(false)
      })

    return () => {
      mounted = false
    }
  }, [room])

  const bedData = useMemo(
    () =>
      (displayRoom?.giuong ?? []).map((bed) => {
        const currentStay = bed.lichSuBoTriPhong?.[0]
        const currentStudent = currentStay?.hocVien
        const isOccupied = Boolean(currentStudent)
        return {
          key: bed.id,
          ma_giuong: bed.ma_giuong,
          hoc_vien: currentStudent
            ? `${currentStudent.ma_hoc_vien ?? 'N/A'} - ${currentStudent.ho_ten ?? 'Chưa có tên'}`
            : null,
          trang_thai: isOccupied ? 'Có người' : 'Trống',
        }
      }),
    [displayRoom],
  )

  if (!room || !displayRoom) return null

  const bedColumns = [
    {
      title: 'Mã giường',
      dataIndex: 'ma_giuong',
      key: 'ma_giuong',
      width: 180,
      render: (value: string) => (
        <Text code style={{ fontSize: 12 }}>
          {value}
        </Text>
      ),
    },
    {
      title: 'Học viên đang ở',
      dataIndex: 'hoc_vien',
      key: 'hoc_vien',
      render: (value: string | null) => value ?? <Text type="secondary">Trống</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trang_thai',
      key: 'trang_thai',
      width: 130,
      render: (value: 'Trống' | 'Có người') => (
        <Tag color={value === 'Có người' ? 'green' : 'default'}>{value}</Tag>
      ),
    },
  ]

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <HomeOutlined style={{ color: '#1890ff' }} />
          <span>Chi tiết phòng: {displayRoom.ma_phong}</span>
        </div>
      }
      open={!!room}
      onCancel={onClose}
      footer={null}
      width={700}
      loading={loadingDetail}
    >
      <Descriptions
        bordered
        column={2}
        size="small"
        style={{ marginTop: 16 }}
      >
        <Descriptions.Item label="Mã phòng" span={2}>
          <span style={{
            fontWeight: 700,
            fontSize: 14,
            color: '#1d4ed8',
            fontFamily: 'monospace',
            background: '#e6f7ff',
            padding: '4px 12px',
            borderRadius: 4,
          }}>
            {displayRoom.ma_phong}
          </span>
        </Descriptions.Item>

        <Descriptions.Item label="Tòa nhà" span={1}>
          <strong>{displayRoom.tang?.toaNha?.ten_toa ?? displayRoom.tang?.toaNha?.ma_toa ?? 'N/A'}</strong>
        </Descriptions.Item>

        <Descriptions.Item label="Mã tòa" span={1}>
          {displayRoom.tang?.toaNha?.ma_toa ?? 'N/A'}
        </Descriptions.Item>

        <Descriptions.Item label="Tầng" span={1}>
          {displayRoom.tang?.so_tang != null ? (
            <Tag color="blue" style={{ fontSize: 13 }}>
              Tầng {displayRoom.tang.so_tang}
            </Tag>
          ) : 'N/A'}
        </Descriptions.Item>

        <Descriptions.Item label="Số giường" span={1}>
          <span style={{
            fontWeight: 700,
            fontSize: 14,
            color: (displayRoom.giuong?.length ?? 0) > 0 ? '#52c41a' : '#8c8c8c'
          }}>
            {displayRoom.giuong?.length ?? 0}
          </span>
        </Descriptions.Item>

        <Descriptions.Item label="Loại phòng" span={1}>
          {displayRoom.loai_phong ? (
            <Tag
              color={displayRoom.loai_phong === 'HOC_VIEN' ? 'purple' : 'orange'}
              icon={displayRoom.loai_phong === 'HOC_VIEN' ? <TeamOutlined /> : undefined}
              style={{ fontSize: 13 }}
            >
              {displayRoom.loai_phong === 'HOC_VIEN' ? 'Học Viên' : 'Cán Bộ'}
            </Tag>
          ) : (
            <Tag>Chưa xác định</Tag>
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Giới tính" span={1}>
          {displayRoom.gioi_tinh_phong ? (
            <Tag
              color={displayRoom.gioi_tinh_phong === 'NAM' ? 'cyan' : 'pink'}
              icon={displayRoom.gioi_tinh_phong === 'NAM' ? <ManOutlined /> : <WomanOutlined />}
              style={{ fontSize: 13 }}
            >
              {displayRoom.gioi_tinh_phong === 'NAM' ? 'Nam' : 'Nữ'}
            </Tag>
          ) : (
            <Tag>Chưa xác định</Tag>
          )}
        </Descriptions.Item>

        {displayRoom.tang?.toaNha?.co_so && (
          <Descriptions.Item label="Cơ sở" span={2}>
            {displayRoom.tang.toaNha.co_so}
          </Descriptions.Item>
        )}

        <Descriptions.Item label="ID Phòng" span={1}>
          <code style={{
            background: '#fafafa',
            padding: '2px 6px',
            borderRadius: 3,
            fontSize: 12
          }}>
            #{displayRoom.id}
          </code>
        </Descriptions.Item>

        <Descriptions.Item label="ID Tầng" span={1}>
          <code style={{
            background: '#fafafa',
            padding: '2px 6px',
            borderRadius: 3,
            fontSize: 12
          }}>
            #{displayRoom.tang?.id ?? 'N/A'}
          </code>
        </Descriptions.Item>
      </Descriptions>

      <Divider style={{ margin: '20px 0 12px' }}>Danh sách giường</Divider>
      <Table
        columns={bedColumns}
        dataSource={bedData}
        pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }}
        size="small"
        locale={{ emptyText: 'Chưa có giường nào trong phòng' }}
        rowKey="key"
      />
    </Modal>
  )
}
